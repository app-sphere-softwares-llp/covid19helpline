import {BaseService} from '../base.service';
import {ClientSession, Document, Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {ModuleRef} from '@nestjs/core';
import {Injectable, OnModuleInit} from '@nestjs/common';
import {GeneralService} from '../general.service';
import {CityModel, DbCollection, MongooseQueryModel, ReasonModel} from "@covid19-helpline/models";
import {BadRequest} from "../../helpers/helpers";

@Injectable()
export class ReasonService extends BaseService<ReasonModel & Document> implements OnModuleInit {

  constructor(
    @InjectModel(DbCollection.state) private readonly _reasonModel: Model<ReasonModel & Document>,
    private _moduleRef: ModuleRef, private readonly _generalService: GeneralService
  ) {
    super(_reasonModel);
  }

  onModuleInit(): void {
  }

  /**
   * add update a reason
   * check model validations
   * @param model
   */
  async addUpdate(model: ReasonModel) {
    if (!model || !model.name) {
      BadRequest('Reason name is mandatory');
    }

    // add/update reason process
    const result = await this.withRetrySession(async (session: ClientSession) => {

      if (model.id) {
        await this.getDetails(model.id);
      }

      // check if duplicate
      if (await this.isDuplicate(model)) {
        BadRequest('Duplicate Reason Name is not allowed..');
      }

      const reason = new ReasonModel();
      reason.name = model.name;

      if (!model.id) {
        reason.createdById = this._generalService.userId;

        // create new reason
        const newState = await this.create([reason], session);
        return newState[0];
      } else {
        reason.updatedById = this._generalService.userId;

        // update reason by id
        await this.updateById(model.id, reason, session);
        return model;
      }
    });

    // return report details
    return await this.getDetails(result.id);
  }

  /**
   * delete reason
   * @param id
   */
  async deleteReason(id: string) {
    return this.withRetrySession(async (session: ClientSession) => {
      // check whether reason exists
      await this.getDetails(id);

      // delete reason
      await this.delete(id, session);

      return 'Reason deleted successfully';
    });
  }

  /**
   * get all reason
   * search by name
   * @param term
   */
  async getAllReason(term: string) {

    const query = new MongooseQueryModel();

    query.filter = {
      isDeleted: false,
      $and: [{
        $or: [
          {name: {$regex: new RegExp(term), $options: 'i'}},
        ]
      }]
    };
    return this.find(query);

  }

  /**
   * get state details by id
   * @param id
   */
  async getDetails(id: string) {
    try {
      if (!this.isValidObjectId(id)) {
        BadRequest('State not found..');
      }

      const reasonDetails = await this.findOne({
        filter: {_id: id},
        lean: true
      });

      if (!reasonDetails) {
        BadRequest('State not found...');
      } else {
        reasonDetails.id = reasonDetails._id;
      }

      return reasonDetails;
    } catch (e) {
      throw e;
    }
  }

  /**
   * bulk insert reason
   * @param model
   */
  async bulkInsert(model: ReasonModel[]) {
    if (!model || model.length) {
      BadRequest('Please add at least one Reason');
    }

    return this.withRetrySession(async (session) => {
      return this.create(model, session);
    });
  }

  /**
   * duplicate checker
   * check duplicity for name
   * if exceptThisId present than filter that record
   * @param stateModel
   * @param exceptThisId
   */
  public async isDuplicate(stateModel: ReasonModel, exceptThisId: string = null): Promise<boolean> {
    const queryFilter = {
      $and: [
        {
          $or: [
            {name: {$regex: `^${stateModel.name.trim()}$`, $options: 'i'}},
          ]
        }
      ]
    };

    // if exceptThisId present then filter the result for this id
    if (exceptThisId) {
      queryFilter.$and.push({_id: {$ne: exceptThisId}} as any);
    }

    const result = await this.find({
      filter: queryFilter
    });

    return !!(result && result.length);
  }

}
