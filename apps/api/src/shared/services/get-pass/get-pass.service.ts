import {BaseService} from '../base.service';
import {ClientSession, Document, Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {ModuleRef} from '@nestjs/core';
import {Injectable, OnModuleInit} from '@nestjs/common';
import {GeneralService} from '../general.service';
import {CityModel, DbCollection, GetPassModel, MongooseQueryModel} from "@covid19-helpline/models";
import {BadRequest} from "../../helpers/helpers";

@Injectable()
export class GetPassService extends BaseService<GetPassModel & Document> implements OnModuleInit {

  constructor(
    @InjectModel(DbCollection.getPass) private readonly _getPassModel: Model<GetPassModel & Document>,
    private _moduleRef: ModuleRef, private readonly _generalService: GeneralService
  ) {
    super(_getPassModel);
  }

  onModuleInit(): void {
  }

  /**
   * add update a get pass
   * check model validations
   * @param model
   */
  async addUpdate(model: CityModel) {
    if (!model || !model.name) {
      BadRequest('City name is mandatory');
    }

    if (!model.stateId) {
      BadRequest('State name is mandatory');
    }

    return await this.withRetrySession(async (session: ClientSession) => {

      if (model.id) {
        await this.getDetails(model.id);
      }

      // check if duplicate
      if (await this.isDuplicate(model)) {
        BadRequest('Duplicate City Name is not allowed..');
      }

      const city = new CityModel();
      city.name = model.name;
      city.stateId = model.stateId;
      city.createdById = this._generalService.userId;

      if (!model.id) {
        const newCity = await this.create([city], session);
        return newCity[0];
      } else {
        // update task priority by id
      }
    });
  }

  /**
   * get all cities
   * search by name
   * @param stateId
   * @param term
   */
  async getAllPasses(stateId: string, term: string) {

    const query = new MongooseQueryModel();

    query.filter = {
      isDeleted: false,
      stateId: stateId,
      $and: [{
        $or: [
          {name: {$regex: new RegExp(term), $options: 'i'}},
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
        BadRequest('City not found..');
      }

      const cityDetails = await this.findOne({
        filter: {_id: id},
        lean: true
      });

      if (!cityDetails) {
        BadRequest('State not found...');
      } else {
        cityDetails.id = cityDetails._id;
      }

      return cityDetails;
    } catch (e) {
      throw e;
    }
  }

  /**
   * duplicate checker
   * check duplicity for name
   * if exceptThisId present than filter that record
   * @param cityModel
   * @param exceptThisId
   */
  public async isDuplicate(cityModel: CityModel, exceptThisId: string = null): Promise<boolean> {
    const queryFilter = {
      $and: [
        {
          $or: [
            {name: {$regex: `^${cityModel.name.trim()}$`, $options: 'i'}},
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
