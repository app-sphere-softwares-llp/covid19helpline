import {BaseService} from '../base.service';
import {ClientSession, Document, Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {ModuleRef} from '@nestjs/core';
import {Injectable, OnModuleInit} from '@nestjs/common';
import {GeneralService} from '../general.service';
import {
  DbCollection, GetAllPassesRequestModel,
  MongooseQueryModel,
  PassModel,
  PassStatusEnum, SendSmsModel,
  UpdatePassStatusRequestModel
} from "@covid19-helpline/models";
import {BadRequest, generateUtcDate, toObjectId} from "../../helpers/helpers";
import {I18nRequestScopeService} from "nestjs-i18n";
import {PassUtilityService} from "./pass.utility.service";
import {SmsService} from "../sms/sms.service";
import {DEFAULT_SMS_SENDING_OPTIONS} from "../../helpers/defaultValueConstant";

const COMMON_POPULATION = [{
  path: 'reason',
  select: 'name',
  justOne: true
}, {
  path: 'state',
  select: 'name',
  justOne: true
}, {
  path: 'city',
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

const PASS_SORTING_MAPPER = new Map<string, string>([
  ['firstName', 'firstName'],
  ['lastName', 'lastName'],
  ['stateId', 'state.name'],
  ['state', 'state.name'],
  ['cityId', 'city.name'],
  ['city', 'city.name'],
  ['passDate', 'passDate'],
  ['reasonId', 'reason.name'],
  ['reason', 'reason.name'],
  ['status', 'passStatus.status']
]);

@Injectable()
export class PassService extends BaseService<PassModel & Document> implements OnModuleInit {
  private _utilityService: PassUtilityService;

  constructor(
    @InjectModel(DbCollection.pass) private readonly passModel: Model<PassModel & Document>,
    private _moduleRef: ModuleRef, private readonly _generalService: GeneralService,
    protected readonly i18n: I18nRequestScopeService, private readonly _smsService: SmsService
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
      pass.otherPersonDetails = model.otherPersonDetails || [];
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

    return this.withRetrySession(async (session: ClientSession) => {
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
      await this.updateById(model.id, {$set: {passStatus: updateStatusDoc}}, session);

      const smsTemplate = PassStatusEnum.approved ? `Your Pass has been Approved
         Please Carry your Aadhaar Card` : `Your Pass has been Rejected, Please try again`;

      // send sms that for status is updated
      const smsModel = new SendSmsModel();
      smsModel.route = DEFAULT_SMS_SENDING_OPTIONS.route;
      smsModel.sender = DEFAULT_SMS_SENDING_OPTIONS.sender;
      smsModel.sms = [{
        to: [passDetails.mobileNo],
        message: smsTemplate
      }];

      this._smsService.sendSms(smsModel);

      // return
      return await this.i18n.translate('pass.RESPONSES.STATUS_UPDATED');
    });
  }

  /**
   * get all cities
   * search by name
   * @param model
   */
  async getAllPasses(model: GetAllPassesRequestModel) {
    // set query filter
    const queryFilter: any = {
      $and: [{
        'passStatus.status': model.status
      }, {
        $or: [{
          firstName: {$regex: new RegExp(model.query.toString()), $options: 'i'},
          lastName: {$regex: new RegExp(model.query.toString()), $options: 'i'},
          aadhaarNo: {$regex: new RegExp(model.query.toString()), $options: 'i'},
          mobileNo: {$regex: new RegExp(model.query.toString()), $options: 'i'},
          vehicleNo: {$regex: new RegExp(model.query.toString()), $options: 'i'}
        }]
      }]
    };

    // check if state id there, than add it to query filter
    if (model.stateId) {
      queryFilter.$and.push(
        {stateId: {$in: [toObjectId(model.stateId)]}}
      );
    }

    // check if city id there, than add it to query filter
    if (model.cityId) {
      queryFilter.$and.push(
        {cityId: {$in: [toObjectId(model.cityId)]}}
      );
    }

    // check if reasonId there, than add it to query filter
    if (model.reasonId && model.reasonId.length) {
      model.reasonId = model.reasonId.map(reasonId => toObjectId(reasonId));
      queryFilter.$and.push(
        {reasonId: {$in: model.reasonId}}
      );
    }

    // check is valid key for sorting...
    if (model.sort) {
      model.sort = PASS_SORTING_MAPPER.get(model.sort);
    } else {
      model.sort = 'passStatus.status';
      model.sortBy = 'asc';
    }

    const passes = await this.dbModel
      .aggregate()
      .match(queryFilter)
      .lookup({
        from: DbCollection.reason,
        let: {reasonId: '$reasonId'},
        pipeline: [
          {$match: {$expr: {$eq: ['$_id', '$$reasonId']}}},
          {$project: {name: 1}},
          {$addFields: {id: '$_id'}}
        ],
        as: 'reason'
      })
      .unwind({path: '$reason', preserveNullAndEmptyArrays: true})
      .lookup({
        from: DbCollection.state,
        let: {stateId: '$stateId'},
        pipeline: [
          {$match: {$expr: {$eq: ['$_id', '$$stateId']}}},
          {$project: {name: 1}},
          {$addFields: {id: '$_id'}}
        ],
        as: 'state'
      })
      .unwind({path: '$state', preserveNullAndEmptyArrays: true})
      .lookup({
        from: DbCollection.city,
        let: {cityId: '$cityId'},
        pipeline: [
          {$match: {$expr: {$eq: ['$_id', '$$cityId']}}},
          {$project: {name: 1}},
          {$addFields: {id: '$_id'}}
        ],
        as: 'city'
      })
      .unwind({path: '$city', preserveNullAndEmptyArrays: true})
      .sort({[model.sort]: model.sortBy === 'asc' ? 1 : -1})
      .skip((model.count * model.page) - model.count)
      .limit(model.count);

    // query for all counting all matched tasks
    const countQuery = await this.dbModel.aggregate().match(queryFilter).count('totalRecords');
    let totalRecordsCount = 0;
    if (countQuery && countQuery[0]) {
      totalRecordsCount = countQuery[0].totalRecords;
    }

    // return paginated response
    return {
      page: model.page,
      totalItems: totalRecordsCount,
      totalPages: Math.ceil(totalRecordsCount / model.count),
      count: model.count,
      items: passes
    };
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
        passDetails.attachmentDetails = passDetails.attachmentDetails || [];
      }

      return passDetails;
    } catch (e) {
      throw e;
    }
  }
}
