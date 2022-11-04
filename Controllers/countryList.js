const db = require("../Config/database");
const fs = require("fs");

const Country = require("../Models/countries.model");
const GovernanceStats = require("../Models/governance-stats.model");

function myFunc(obj, prop) {
  return obj.reduce(function (acc, item) {
    let key = item[prop];
    if (typeof key === "string") {
      key = key.replace(/\s+/g, "");
    }
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
}

const getCountryList = async (req, res) => {
  let data = await Country.aggregate([
    {
        $lookup:
        {
            from: "ndhs_masters",
            localField: "id",
            foreignField : "country_id",
            as: "ndhs_masters"
        }
    },
    {
        $unwind:"$ndhs_masters"
    },
    {
        $project: {
            "id":1,
            "name":1,
            "flag":1,
            "iso_code":1,
            "lat":1,
            "lng":1,
            "name":1,
            "ndhs_masters.year":1
        }
    },
    { $group : { _id :{ id:"$id", country_name:"$name", flag:"$flag", iso:"$iso_code", lat:"$lat", lng:"$lng", 
                  name:"$name", year:"$ndhs_masters.year"
               } 
    }
    },
    { $sort : { "_id.id" : 1} }
  ]);
  res.status(200).send(data);
};

const getComparativeInfo = async (req, res) => {
    let parameters = {
        "development_types.id":Number(req.body.development_types_id), 
        "ultimate.id":Number(req.body.ultimate_fields_id),
        "taxonomies.governance_id":Number(req.body.governance_id)
    };

    var countries = req.body.country_id;
    var sepCon = countries.split(",");
    
    let data = await GovernanceStats.aggregate([
        {
            $match: {
            $or:[
              {'country_id':Number(sepCon[0])},
              {'country_id':Number(sepCon[1])}
            ]
          }
        },
        {
            $lookup:
            {
                from: "questions",
                localField: "question_id",
                foreignField : "id",
                as: "questions"
            }
        },
        {
            $unwind:"$questions"
        },
        {
            $lookup:
            {
                from: "taxonomies",
                localField: "questions.taxonomy_id",
                foreignField : "id",
                as: "taxonomies"
            }
        },
        {
            $unwind:"$taxonomies"
        },
        {
            $lookup:
            {
                from: "ultimate_fields",
                localField: "questions.ultimate_fields_id",
                foreignField : "id",
                as: "ultimate"
            }
        },
        {
            $unwind:"$ultimate"
        },
        {
            $lookup:
            {
                from: "countries",
                localField: "country_id",
                foreignField : "id",
                as: "country"
            }
        },
        {
            $unwind:"$country"
        },
        {
            $lookup:
            {
                from: "development_types",
                localField: "questions.development_types_id",
                foreignField : "id",
                as: "development_types"
            }
        },
        {
            $unwind:"$development_types"
        },
        {
            $match:parameters
        },
        {
            $project: {
                "country.id":1,
                "country.name":1,
                "taxonomies.id":1,
                "taxonomies.name":1,
                "development_types.name":1,
                "ultimate.name":1,
                score:1
            }
        },
        {
            $group : {_id:
                { taxonomy_id:"$taxonomies.id", taxonomy_name:"$taxonomies.name", country_id:"$country.id", 
                country_name:"$country.name", ultimate_field:"ultimate.name", development_name:"development_types.name",
                ultimate_field_id:"$ultimate.id"}, score:{$sum:"$score"}, }
        },
        { $sort : { _id : 1 } }
    ]);
    res.status(200).send(data);
};

const getGovernanceStats = async (req, res) => {
    let reqobj = {
        country_id:Number(req.params.country_id), year:Number(req.params.year)
    };
    let gov = {
        "taxonomy.governance_id":Number(req.params.governance_id)
    }

    let data = await GovernanceStats.aggregate([
        {
            $match:reqobj
        },
        {
         $lookup:
            {
                from: "questions",
                localField: "question_id",
                foreignField : "id",
                as: "questions"
            }
        },
        {
            $unwind:"$questions"
        },
        {
         $lookup:
            {
                from: "taxonomies",
                localField: "questions.taxonomy_id",
                foreignField : "id",
                as: "taxonomy"
            }
        },
        {
            $unwind:"$taxonomy"
        },
        {
         $lookup:
            {
                from: "development_types",
                localField: "questions.development_types_id",
                foreignField : "id",
                as: "development_types"
            }
        },
        {
            $unwind:"$development_types"
        },
        {
            $project: {
                score:1,
                country_id:1,
                "taxonomy.id":1,
                "taxonomy.name":1,
                "development_types.id":1,
                "development_types.name":1,
                "questions.ultimate_fields_id":1,
                "taxonomy.governance_id":1
            }
        },
        {
            $match:gov
        },
        {
            $group : {_id:
                { taxonomy_id:"$taxonomy.id", taxonomy_name:"$taxonomy.name", country_id:"$country_id",
                  development_types_id:"$development_types.id", development_name:"$development_types.name", 
                  ultimate_field_id:"$questions.ultimate_fields_id"}, score:{$sum:"$score"}, }
        }, 
        { $sort : { _id : 1 } }
    ]);
    res.status(200).send(data);
};

const getTopCountries = async (req, res) => {
    let parameters = {
        "development_types.id":Number(req.body.development_types_id), 
        "ultimate.id":Number(req.body.ultimate_fields_id),
        "taxonomies.governance_id":Number(req.body.governance_id),
        "taxonomies.id":Number(req.body.taxonomy_id)
    };
    
    let data = await GovernanceStats.aggregate([
        {
            $match: {
            $or:[
              {'year':2021},
              {'year':2022}
            ]
          }
        },
        {
            $lookup:
            {
                from: "questions",
                localField: "question_id",
                foreignField : "id",
                as: "questions"
            }
        },
        {
            $unwind:"$questions"
        },
        {
            $lookup:
            {
                from: "taxonomies",
                localField: "questions.taxonomy_id",
                foreignField : "id",
                as: "taxonomies"
            }
        },
        {
            $unwind:"$taxonomies"
        },
        {
            $lookup:
            {
                from: "ultimate_fields",
                localField: "questions.ultimate_fields_id",
                foreignField : "id",
                as: "ultimate"
            }
        },
        {
            $unwind:"$ultimate"
        },
        {
            $lookup:
            {
                from: "countries",
                localField: "country_id",
                foreignField : "id",
                as: "country"
            }
        },
        {
            $unwind:"$country"
        },
        {
            $lookup:
            {
                from: "development_types",
                localField: "questions.development_types_id",
                foreignField : "id",
                as: "development_types"
            }
        },
        {
            $unwind:"$development_types"
        },
        {
            $match:parameters
        },
        {
            $project: {
                "country.id":1,
                "country.name":1,
                "taxonomies.id":1,
                "taxonomies.name":1,
                "development_types.name":1,
                "ultimate.name":1,
                score:1
            }
        },
        {
            $group : {_id:
                { country_id:"$country.id", country_name:"$country.name", taxonomy_id:"$taxonomies.id", tasxonomy_name:"$taxonomies.name", 
                development_type:"development_types.name", ultimate_field:"$ultimate.name"}, score:{$sum:"$score"}, }
        },
        { $sort : { score : -1 } },
        { $limit : 5 }
    ]);
    res.status(200).send(data);
};

const getStatsGraph = async (req, res) => {
    let parameters = {
        "development_types.id":Number(req.body.development_types_id), 
        "ultimate.id":Number(req.body.ultimate_fields_id),
        "taxonomies.governance_id":Number(req.body.governance_id),
        "taxonomies.id":Number(req.body.taxonomy_id)
    };

    var countries = req.body.countries;
    var sepCon = countries.split(",");

    let data = await GovernanceStats.aggregate([
        {
            $match: {
            $or:[
              {'country_id':Number(sepCon[0])},
              {'country_id':Number(sepCon[1])}
            ]
          }
        },
        {
            $lookup:
            {
                from: "questions",
                localField: "question_id",
                foreignField : "id",
                as: "questions"
            }
        },
        {
            $unwind:"$questions"
        },
        {
            $lookup:
            {
                from: "taxonomies",
                localField: "questions.taxonomy_id",
                foreignField : "id",
                as: "taxonomies"
            }
        },
        {
            $unwind:"$taxonomies"
        },
        {
            $lookup:
            {
                from: "ultimate_fields",
                localField: "questions.ultimate_fields_id",
                foreignField : "id",
                as: "ultimate"
            }
        },
        {
            $unwind:"$ultimate"
        },
        {
            $lookup:
            {
                from: "countries",
                localField: "country_id",
                foreignField : "id",
                as: "country"
            }
        },
        {
            $unwind:"$country"
        },
        {
            $lookup:
            {
                from: "development_types",
                localField: "questions.development_types_id",
                foreignField : "id",
                as: "development_types"
            }
        },
        {
            $unwind:"$development_types"
        },
        {
            $lookup:
            {
                from: "governance_types",
                localField: "taxonomies.governance_id",
                foreignField : "id",
                as: "governance"
            }
        },
        
        {
            $unwind:"$governance"
        },
        {
            $match:parameters
        },
        {
            $project: {
                "development_types.id":1,
                "country.id":1,
                "country.name":1,
                "taxonomies.id":1,
                "taxonomies.name":1,
                "country.iso_code":1,
                "governance.id":1,
                "governance.name":1,
                "development_types.name":1,
                "ultimate.id":1,
                "ultimate.name":1,
                "score":1,
                "taxonomies.taxonomy_score":1
            }
        },
        {
          $group : {_id:
              { development_types_id:"$development_types.id" ,country_id:"$country.id", country_name:"$country.name", 
              taxonomy_id:"$taxonomies.id", taxonomy_name:"$taxonomies.name", iso_code:"$country.iso_code",
              ultimate_field_id:"ultimate.id", governance_id:"$governance.id", governance_name:"$governance.name",
              development_type:"$development_types.name", ultimate_field_id:"$ultimate.id", ultimate_field:"$ultimate.name",
              total:"$taxonomies.taxonomy_score" }, score:{$sum:"$score"}, }
        },
        { $sort : { country_id : 1 } }
    ]);
    res.status(200).send(data);
};

const getStatsTable = async (req, res) => {
    let parameters = {
        "development_types.id":Number(req.body.development_types_id), 
        "ultimate.id":Number(req.body.ultimate_fields_id),
        "taxonomies.governance_id":Number(req.body.governance_id),
        "taxonomies.id":Number(req.body.taxonomy_id)
    };

    var countries = req.body.countries;
    var sepCon = countries.split(",");

    let data = await GovernanceStats.aggregate([
        {
            $match: {
            $or:[
              {'country_id':Number(sepCon[0])},
              {'country_id':Number(sepCon[1])}
            ]
          }
        },
        {
            $lookup:
            {
                from: "questions",
                localField: "question_id",
                foreignField : "id",
                as: "questions"
            }
        },
        {
            $unwind:"$questions"
        },
        {
            $lookup:
            {
                from: "taxonomies",
                localField: "questions.taxonomy_id",
                foreignField : "id",
                as: "taxonomies"
            }
        },
        {
            $unwind:"$taxonomies"
        },
        {
            $lookup:
            {
                from: "ultimate_fields",
                localField: "questions.ultimate_fields_id",
                foreignField : "id",
                as: "ultimate"
            }
        },
        {
            $unwind:"$ultimate"
        },
        {
            $lookup:
            {
                from: "countries",
                localField: "country_id",
                foreignField : "id",
                as: "country"
            }
        },
        {
            $unwind:"$country"
        },
        {
            $lookup:
            {
                from: "development_types",
                localField: "questions.development_types_id",
                foreignField : "id",
                as: "development_types"
            }
        },
        {
            $unwind:"$development_types"
        },
        {
            $lookup:
            {
                from: "governance_types",
                localField: "taxonomies.governance_id",
                foreignField : "id",
                as: "governance"
            }
        },
        {
            $unwind:"$governance"
        },
        {
            $match:parameters
        },
        {
            $project: {
                "development_types.id":1,
                "country.id":1,
                "country.name":1,
                "taxonomies.id":1,
                "taxonomies.name":1,
                "development_types.name":1,
                "ultimate.id":1,
                "ultimate.name":1,
                "governance.id":1,
                "governance.name":1,
                "country.iso_code":1,
                "taxonomies.taxonomy_score":1,
                "score":1
            }
        },
        {
          $group : {_id:
              { development_types_id:"$development_types.id" ,country_id:"$country.id", country_name:"$country.name", 
              taxonomy_id:"$taxonomies.id", taxonomy_name:"$taxonomies.name", iso_code:"$country.iso_code",
              governance_id:"$governance.id", governance_name:"$governance.name", development_types:"$development_types.name",
              ultimate_field_id:"$ultimate.id", ultimate_field:"$ultimate.name",
              total:"$taxonomies.taxonomy_score"}, score:{$sum:"$score"}, }
        },
        { $sort : { score : -1 } }
    ]);
    res.status(200).send(data);
};

const getOverview = async (req, res) => {
    let parameters = {
        "country.id":Number(req.body.country_id), 
        "taxonomies.governance_id":Number(req.body.governance_id),
    };

    let data = await GovernanceStats.aggregate([
        {
            $lookup:
            {
                from: "questions",
                localField: "question_id",
                foreignField : "id",
                as: "questions"
            }
        },
        {
            $unwind:"$questions"
        },
        {
            $lookup:
            {
                from: "taxonomies",
                localField: "questions.taxonomy_id",
                foreignField : "id",
                as: "taxonomies"
            }
        },
        {
            $unwind:"$taxonomies"
        },
        {
            $lookup:
            {
                from: "ultimate_fields",
                localField: "questions.ultimate_fields_id",
                foreignField : "id",
                as: "ultimate"
            }
        },
        {
            $unwind:"$ultimate"
        },
        {
            $lookup:
            {
                from: "countries",
                localField: "country_id",
                foreignField : "id",
                as: "country"
            }
        },
        {
            $unwind:"$country"
        },
        {
            $lookup:
            {
                from: "development_types",
                localField: "questions.development_types_id",
                foreignField : "id",
                as: "development_types"
            }
        },
        {
            $unwind:"$development_types"
        },
        {
            $lookup:
            {
                from: "governance_types",
                localField: "taxonomies.governance_id",
                foreignField : "id",
                as: "governance"
            }
        },
        {
            $unwind:"$governance"
        },
        {
            $lookup:
            {
                from: "indicators",
                localField: "questions.indicator_id",
                foreignField : "id",
                as: "indicators"
            }
        },
        {
            $unwind:"$indicators"
        },
        {
            $lookup:
            {
                from: "question_master",
                localField: "questions.question_id",
                foreignField : "id",
                as: "question_master"
            }
        },
        {
            $unwind:"$question_master"
        },
        {
            $match:parameters
        },
        {
            $project: {
                "development_types.id":1,
                "country.id":1,
                "country.name":1,
                "taxonomies.id":1,
                "taxonomies.name":1,
                "development_types.name":1,
                "ultimate.id":1,
                "ultimate.name":1,
                "indicators.id":1,
                "indicators.name":1,
                "questions.indicator_score":1,
                "questions.question_id":1,
                "question_master.name":1,
                "questions.question_score":1,
                "score":1,
                "status":1
            }
        },
        {
          $group : {_id:
              { development_types_id:"$development_types.id" ,country_id:"$country.id", country_name:"$country.name", 
              taxonomy_id:"$taxonomies.id", taxonomy_name:"$taxonomies.name", iso_code:"$country.iso_code", 
              development_types:"$development_types.name", ultimate_field_id:"$ultimate.id", ultimate_field:"$ultimate.name",
              total:"$taxonomies.taxonomy_score", indicator_id:"$indicators.id", indicator_name:"$indicators.name", 
              indicator_score:"$questions.indicator_score", question_id:"$questions.question_id", question:"$question_master.name", 
              question_score:"$questions.question_score", status:"$status"}, score:{$sum:"$score"}, }
        },
        { $sort : { development_types_id : 1 } },
        { $sort : { ultimate_field_id : 1 } },
        { $sort : { indicator_id : 1 } },
        { $sort : { taxonomy_id : 1 } }
    ]);
    res.status(200).send(data);
};

const getComapative = async (req, res) => {
   
    var countries = req.body.country_id;
    var sepCon = countries.split(",");

    var governance = req.body.governance_id;
    var sepGov = governance.split(",");

    let data = await GovernanceStats.aggregate([
        {
            $lookup:
            {
                from: "questions",
                localField: "question_id",
                foreignField : "id",
                as: "questions"
            }
        },
        {
            $unwind:"$questions"
        },
        {
            $lookup:
            {
                from: "taxonomies",
                localField: "questions.taxonomy_id",
                foreignField : "id",
                as: "taxonomies"
            }
        },
        {
            $unwind:"$taxonomies"
        },
        {
            $lookup:
            {
                from: "ultimate_fields",
                localField: "questions.ultimate_fields_id",
                foreignField : "id",
                as: "ultimate"
            }
        },
        {
            $unwind:"$ultimate"
        },
        {
            $lookup:
            {
                from: "countries",
                localField: "country_id",
                foreignField : "id",
                as: "country"
            }
        },
        {
            $unwind:"$country"
        },
        {
            $lookup:
            {
                from: "development_types",
                localField: "questions.development_types_id",
                foreignField : "id",
                as: "development_types"
            }
        },
        {
            $unwind:"$development_types"
        },
        {
            $lookup:
            {
                from: "governance_types",
                localField: "taxonomies.governance_id",
                foreignField : "id",
                as: "governance"
            }
        },
        {
            $unwind:"$governance"
        },
        {
            $match: {
            $or:[
              {'country_id':Number(sepCon[0])},
              {'country_id':Number(sepCon[1])}
            ]
          }
        },
        {
            $match: {
            $or:[
              {'governance.id':Number(sepGov[0])},
              {'governance.id':Number(sepGov[1])}
            ]
          }
        },
        {
            $project: {
                "development_types.id":1,
                "year":1,
                "country.name":1,
                "governance.id":1,
                "governance.name":1,
                "development_types.name":1,
                "ultimate.id":1,
                "ultimate.name":1,
                "score":1,
                "status":1
            }
        },
        {
          $group : {_id:
              { development_types_id:"$development_types.id", year:"$year", country_name:"$country.name", 
              development_types:"$development_types.name", ultimate_field_id:"$ultimate.id", ultimate_field:"$ultimate.name",
              governance_id:"$governance.id", governance_name:"$governance.name", total:"$taxonomies.taxonomy_score"}, score:{$sum:"$score"}, }
        },
        { $sort : { "development_types.id" : 1 } }
    ]);
    res.status(200).send(data);
};

const testing = async (req, res) => {

};

module.exports = {
  getCountryList,
  getComparativeInfo,
  getGovernanceStats,
  getTopCountries,
  getStatsGraph,
  getStatsTable,
  getOverview,
  getComapative,
  testing,
};
