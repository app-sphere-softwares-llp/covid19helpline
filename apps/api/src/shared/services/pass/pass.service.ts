import {BaseService} from '../base.service';
import {ClientSession, Document, Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {ModuleRef} from '@nestjs/core';
import {Injectable, OnModuleInit} from '@nestjs/common';
import {GeneralService} from '../general.service';
import {DbCollection, PassModel, MongooseQueryModel} from "@covid19-helpline/models";
import {BadRequest} from "../../helpers/helpers";
import {I18nRequestScopeService} from "nestjs-i18n";
import {PassUtilityService} from "./pass.utility.service";

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

    return await this.withRetrySession(async (session: ClientSession) => {

      if (model.id) {
        await this.getDetails(model.id);
      }

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
      pass.createdById = this._generalService.userId;

      if (!model.id) {
        const newCity = await this.create([pass], session);
        return newCity[0];
      } else {
        // update task priority by id
      }
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
   * get pass details by id
   * @param id
   */
  async getDetails(id: string) {
    try {
      if (!this.isValidObjectId(id)) {
        BadRequest('Pass not found..');
      }

      const passDetails = await this.findOne({
        filter: {_id: id},
        lean: true
      });

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
