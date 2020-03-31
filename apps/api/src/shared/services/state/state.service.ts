import {BaseService} from '../base.service';
import {ClientSession, Document, Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {ModuleRef} from '@nestjs/core';
import {Injectable, OnModuleInit} from '@nestjs/common';
import {GeneralService} from '../general.service';
import {DbCollection, MongooseQueryModel, StateModel} from "@covid19-helpline/models";
import {BadRequest} from "../../helpers/helpers";

@Injectable()
export class StateService extends BaseService<StateModel & Document> implements OnModuleInit {

  constructor(
    @InjectModel(DbCollection.state) private readonly _stateModel: Model<StateModel & Document>,
    private _moduleRef: ModuleRef, private readonly _generalService: GeneralService
  ) {
    super(_stateModel);
  }

  onModuleInit(): void {
  }

  /**
   * add update a state
   * check model validations
   * @param model
   */
  async addUpdate(model: StateModel) {
    if (!model || !model.name) {
      BadRequest('State name is mandatory');
    }

    // add/update state
    const result = await this.withRetrySession(async (session: ClientSession) => {

      if (model.id) {
        await this.getDetails(model.id);
      }

      // check if duplicate
      if (await this.isDuplicate(model)) {
        BadRequest('Duplicate State Name is not allowed..');
      }

      const state = new StateModel();
      state.name = model.name;

      if (!model.id) {
        state.createdById = this._generalService.userId;

        const newState = await this.create([state], session);
        return newState[0];
      } else {
        state.updatedById = this._generalService.userId;

        // update task priority by id
        await this.updateById(model.id, state, session);
        return model;
      }
    });

    // return state details
    return await this.getDetails(result.id);
  }

  /**
   * delete state
   * @param id
   */
  async deleteState(id: string) {
    return this.withRetrySession(async (session: ClientSession) => {
      // check whether state exists
      await this.getDetails(id);

      // delete state
      await this.delete(id, session);

      return 'State deleted successfully';
    });
  }

  /**
   * get all state
   * search by name
   * @param term
   */
  async getAllStates(term: string) {

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

      const stateDetail = await this.findOne({
        filter: {_id: id},
        lean: true
      });

      if (!stateDetail) {
        BadRequest('State not found...');
      } else {
        stateDetail.id = stateDetail._id;
      }

      return stateDetail;
    } catch (e) {
      throw e;
    }
  }

  /**
   * bulk insert states
   * @param model
   */
  async bulkInsert(model: StateModel[]) {
    if (!model || model.length) {
      BadRequest('Please add at least one State');
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
  public async isDuplicate(stateModel: StateModel, exceptThisId: string = null): Promise<boolean> {
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
