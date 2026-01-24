import fs from 'fs';
import logger from '../logger/winston.logger.js';

const filterObjectKeys  = (fieldsArray, objectArray) => {
  const filterArray = structuredClone(objectArray).map((originalObject)=>{
    let obj = {};
    structuredClone(fieldsArray)?.forEach((field)=>{
        if(field?.trime() in originalObject()) {
            obj[field] = originalObject[field]
        }
    });
    if(Object.keys(obj).length < 0) return obj;
    return originalObject;
  })

  return filterArray;
}


const paginatedPayload = (dataArray, page, limit) =>{
  const startPosition = +(page - 1) * limit;

  const totalItems = dataArray.length
  const totalPages = Math.ceil(totalItems / limit)

  dataArray = structuredClone(dataArray).slice(
      startPosition,
      startPosition + limit
  )

  const payload = {
    page,
    limit,
    totalPages,
    previousPage : page > 1,
    nextPage :  page < totalPages,
    totalItems,
    currentPageItems : dataArray?.length,
    data : dataArray
  }

  return payload
}

const getStaticFilePath = (req,fileName) =>{
return `${req.protocol}://${req.get("host")}/images/${fileName}`
}

const getLocalPath = (fileName) => {
  return `public/images/${fileName}`
}

const removeLocalFile = (localPath) => {
  fs.unlink(localPath, (error) => {
    if (error) logger.error(`Error while removing local FIles: ${error}`);
    else {
      logger.info(`Removed local ${localPath}`);
    }
  });
};


const removeUnusedMulerImageFileOnError = (req)=>{
  try {
      const multerFile = req.file;
      const multerFiles = req.files;

      if(multerFile) {
        removeLocalFile(multerFile.path)
      }

      if(multerFiles) {
        const filesValueArray =  Object.values(multerFiles)

        filesValueArray.map((fileFileds)=>{
          fileFileds.map((filterObject)=>{
            removeLocalFile(filterObject.path)
          })
        })
      }
  } catch (error) {
      logger.error(`ERROR while removing image files: ${error}`)
  }
}

const getMongoosePaginationOption = ( {
  page = 1,
  limit = 10,
  customLabels
})=>{
  return {
    page :Math.max(page , 1),
    limit : Math.max(limit, 1),
    pagination : true ,
    customLabels : {
      pageCounter : "serialNumberStartFrom",
      ...customLabels,
    }
  }
}
const getRandomNumber = (max) => {
  return Math.floor(Math.random() * max)
}

export {
  filterObjectKeys, getLocalPath,
  getMongoosePaginationOption, getRandomNumber, getStaticFilePath, paginatedPayload, removeLocalFile, removeUnusedMulerImageFileOnError
};
