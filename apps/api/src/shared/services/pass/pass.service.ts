import {BaseService} from '../base.service';
import {ClientSession, Document, Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {ModuleRef} from '@nestjs/core';
import {Injectable, OnModuleInit} from '@nestjs/common';
import {GeneralService} from '../general.service';
import {
  DbCollection,
  MongooseQueryModel,
  PassModel,
  PassStatusEnum,
  UpdatePassStatusRequestModel
} from "@covid19-helpline/models";
import {BadRequest, generateUtcDate} from "../../helpers/helpers";
import {I18nRequestScopeService} from "nestjs-i18n";
import {PassUtilityService} from "./pass.utility.service";

const COMMON_POPULATION = [{
  path: 'reason',
  select: 'name',
  justOne: true
}, {
  path: 'createdBy',
  select: 'mobileNumber userName firstName lastName profilePic -_id',
  justOne: true
}, {
  path: 'updatedBy',
  select: 'mobileNumber userName firstName lastName profilePic -_id',
  justOne: true
}];

const DETAILED_POPULATION = [...COMMON_POPULATION, {
  path: 'attachmentsDetails'
}, {
  path: 'passStatus.updatedBy',
  select: 'mobileNumber userName firstName lastName profilePic -_id',
  justOne: true
}];

@Injectable()
export class PassService extends BaseService<PassModel & Document> implements OnModuleInit {
  private _utilityService: PassUtilityService;

  constructor(
    @InjectModel(DbCollection.pass) private readonly passModel: Model<PassModel & Document>,
    private _moduleRef: ModuleRef, private readonly _generalService: GeneralService,
    protected readonly i18n: I18nRequestScopeService
  ) {
    super(passModel);

    this._utilityService = new PassUtilityService(i18n);
  }

  onModuleInit(): void {
  }

  /**
   * add update a get pass
   * check model validations
   * @param model
   */
  async addUpdate(model: PassModel) {
    // check validations
    await this._utilityService.createPassValidations(model);

    // add/update pass process
    const result = await this.withRetrySession(async (session: ClientSession) => {

      if (model.id) {
        await this.getDetails(model.id);
      }

      // create pass model
      const pass = new PassModel();
      pass.mobileNo = model.mobileNo;
      pass.picUrl = model.picUrl;
      pass.aadharPicUrl = model.aadharPicUrl;
      pass.firstName = model.firstName;
      pass.lastName = model.lastName;
      pass.stateId = model.stateId;
      pass.cityId = model.cityId;
      pass.aadhaarNo = model.aadhaarNo;
      pass.vehicleNo = model.vehicleNo;
      pass.passDate = model.passDate;
      pass.address = model.address;
      pass.reasonId = model.reasonId;
      pass.reasonDetails = model.reasonDetails;
      pass.destinationPinCode = model.destinationPinCode;
      pass.destinationAddress = model.destinationAddress;
      pass.otherPersonDetails = model.otherPersonDetails;
      pass.attachments = model.attachments;

      // if id is not there than create new pass
      if (!model.id) {
        pass.passStatus = {
          status: PassStatusEnum.pending
        };
        pass.createdById = this._generalService.userId;

        const newCity = await this.create([pass], session);
        return newCity[0];
      } else {
        // if id is there than update pass by id
        pass.updatedById = this._generalService.userId;

        await this.updateById(model.id, pass, session);
        return model;
      }
    });

    // get pass details
    return await this.getDetails(result.id);
  }

  /**
   * update pass status
   */
  async updatePassStatus(model: UpdatePassStatusRequestModel) {
    await this._utilityService.updatePassStatusValidations(model);

    return await this.withRetrySession(async (session: ClientSession) => {
      // check pass exists
      const passDetails: PassModel = await this.getDetails(model.id);

      // check if pass is already approved or not
      if (passDetails.passStatus.status === PassStatusEnum.approved) {
        BadRequest(await this.i18n.translate('pass.UPDATE_PASS_STATUS_VALIDATIONS.ALREADY_APPROVED'));
      } else if (passDetails.passStatus.status === PassStatusEnum.rejected) {
        // check if pass is already rejected or not
        BadRequest(await this.i18n.translate('pass.UPDATE_PASS_STATUS_VALIDATIONS.ALREADY_REJECTED'));
      }

      // update status doc
      const updateStatusDoc = {
        status: model.status,
        updatedAt: generateUtcDate(),
        updatedById: this._generalService.userId
      };

      // update pass by id
      await this.updateById(model.id, {$set: updateStatusDoc}, session);

      // return
      return await this.i18n.translate('pass.RESPONSES.STATUS_UPDATED');
    });
  }

  /**
   * get all cities
   * search by name
   * @param term
   */
  async getAllPasses(term: string) {

    const query = new MongooseQueryModel();

    query.filter = {
      isDeleted: false,
      $and: [{
        $or: [
          {mobileNo: {$regex: new RegExp(term), $options: 'i'}},
          {aadhaarNo: {$regex: new RegExp(term), $options: 'i'}},
          {vehicleNo: {$regex: new RegExp(term), $options: 'i'}},
        ]
      }]
    };
    return this.find(query);
  }

  /**
   * get get pass by id
   * @param id
   */
  async getPassById(id: string) {
    return this.getDetails(id, true);
  }

  /**
   * delete pass
   * @param id
   */
  async deletePass(id: string) {
    return await this.withRetrySession(async (session: ClientSession) => {
      // check pass exists
      await this.getDetails(id);

      // delete pass
      await this.delete(id, session);

      return 'Pass deleted successfully';
    });
  }

  /**
   * get pass details by id
   * @param id
   * @param getFullDetails
   */
  async getDetails(id: string, getFullDetails: boolean = false) {
    try {
      if (!this.isValidObjectId(id)) {
        BadRequest('Pass not found..');
      }

      // query object
      const detailsQuery = new MongooseQueryModel();
      detailsQuery.filter = {_id: id};
      detailsQuery.lean = true;
      detailsQuery.populate = COMMON_POPULATION;

      // if get full details is true then send all details
      if (getFullDetails) {
        detailsQuery.populate = DETAILED_POPULATION;
      }

      // get pass details
      const passDetails = await this.findOne(detailsQuery);

      // if pass details not found then throw error
      if (!passDetails) {
        BadRequest('Pass not found...');
      } else {
        passDetails.id = passDetails._id;
      }

      return passDetails;
    } catch (e) {
      throw e;
    }
  }
}
