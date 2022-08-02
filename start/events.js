'use strict'
'use strict'
const moment = require('moment');
const Log = use('App/PxControl/LogManager.js')
const l = new Log

const Database = use('Database')
const BatchRunning = use('App/Models/BatchRunning')
const BatchRejected = use('App/Models/BatchRejected')

const BatchOpt = use('App/Models/BatchOpt')
const FaseOpt = use('App/Models/TermTransOpt')
const ParameterOpt = use('App/Models/OnlineParameterValueOpt')
const vBatch = use('App/Models/VBatch')




async function ciclo() {
  setTimeout(async () => {
    try {
      try {
        await copyBatchsSync()
      }
      catch (error) {
        console.log(moment().format('YYYY-MM-DD HH:mm:ss'), ` (Adquiriendo batchs nuevos) Error: ${error}`)
      }
      try {
        const lstBatch = await getBatchRunningData()
        await controlFinishBatchsComplete(lstBatch)
      }
      catch (error) {
        console.log(moment().format('YYYY-MM-DD HH:mm:ss'), ` (Finalizando batchs) Error: ${error}`)
      }

    }
    catch (error) {
      console.log('Error: ', error)
    }
    finally {
      ciclo()
    }

  }, 10000);
}
async function copyBatchsSync() {

  try {
    let lastSync = []
    let batchs = []
    let batchsFiltrados = []
    // .table('DeclarateSE.sync')
    lastSync = await Database
      .table('sync')

    let desde = moment(lastSync[0].LastSync)
    desde = desde.subtract(20, 'minutes').utc()
    batchs = await Database
      .connection('historian')
      .raw(`SELECT OGUID, CreationDateTime FROM [vBatch] WHERE CreationDateTime >= '${desde.format('YYYY-MM-DD HH:mm:ss')}' ORDER BY CreationDateTime DESC`)
    //.raw(`SELECT OGUID, CreationDateTime FROM [HistorianStorage].[SIMATIC_BATCH_SB6_2118-112-6737-38_V9_00_00].[vBatch] WHERE CreationDateTime BETWEEN '${desde.format('YYYY-MM-DD HH:mm:ss')}' AND '${serverMoment.format('YYYY-MM-DD HH:mm:ss')}' ORDER BY CreationDateTime DESC`)

    if (batchs.length > 0) {
      let lastSyncDate = batchs[0].CreationDateTime;

      let arrayOGUIDBatchs = batchs.map(it => {
        return it.OGUID;
      })
      let lstOguids = await Promise.all(arrayOGUIDBatchs);

      let batchsYaProcesados = await BatchOpt.query().select('OGUID').whereIn('OGUID', lstOguids).fetch()
      batchsYaProcesados = batchsYaProcesados.toJSON()

      if (batchsYaProcesados.length > 0) {

        let arrayBatchsYaProcesados = batchsYaProcesados.map(it => {
          return it.OGUID;
        })
        let lstOguidsBatchYaProcesados = await Promise.all(arrayBatchsYaProcesados);

        batchsFiltrados = await batchs.filter(it => !lstOguidsBatchYaProcesados.includes(it.OGUID))
      }
      else {
        batchsFiltrados = batchs
      }

      let arrayCreate = batchsFiltrados.map(it => {
        delete it.CreationDateTime;
        return it;
      })

      arrayCreate = await Promise.all(arrayCreate)


      if (batchsFiltrados.length > 0) {
        const respuesta = await BatchRunning.createMany(arrayCreate)
        console.log('Batchs insertados: ', batchsFiltrados.length)
        //console.log(respuesta)/// controlar si tira bien los datos

        try {
          await Database
            .raw(`UPDATE sync SET lastSync = '${moment(lastSyncDate).utc().format('YYYY-MM-DD HH:mm:ss')}'`)

          //.raw(`UPDATE DeclarateSE.sync SET lastSync = '${moment(batchs[0].CreationDateTime).utc().format('YYYY-MM-DD HH:mm:ss')}'`)
        }
        catch (error) {

          l.logDB(`${moment().format('YYYY-MM-DD HH:mm:ss')} (Error al actualizar la fecha de sincronizacion) Error: ${error}`)
          console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')} (Error al actualizar la fecha de sincronizacion) Error: ${error}`)
        }
      }
    }

    if (batchsFiltrados.length > 0) {
      l.logApp(`${moment().format('YYYY-MM-DD HH:mm:ss')} (Batchs cargados con exito)`)
      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')} (Batchs cargados con exito)`)
    }


  } catch (error) {
    l.logApp(`${moment().format('YYYY-MM-DD HH:mm:ss')} (Error al cargar los batchs) Error: ${error}`)
    console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')} (Error al cargar los batchs) Error: ${error}`)
  }


}

//Cambiar nombre
async function getBatchRunningData() {

  let oguidList = []
  oguidList = await Database
    .raw('SELECT OGUID FROM batchRunning')

  if (oguidList.length > 0) {
    let arrayPromesas = oguidList.map(it => {
      return it.OGUID
    })
    let arrayOGUIDS = await Promise.all(arrayPromesas)


    let lstBatch = []
    try {
      lstBatch = await Database
        .connection('historian')//Agregar los demas campos
        .raw(`SELECT ROOTGUID,ROOTOBJID,ROOTOTID,OGUID,OBJID,OTID,Name,Quantity,
        FormulaCategoryName,FormulaName,MRecipeName,ProductCode,ActStart,ActEnd,State FROM [vBatch] WHERE OGUID in ('${arrayOGUIDS.join('\',\'')}')`)
      // .raw(`SELECT OGUID, State, CreationDateTime FROM [HistorianStorage].[SIMATIC_BATCH_SB6_2118-112-6737-38_V9_00_00].[vBatch] WHERE OGUID in ('${arrayOGUIDS.join('\',\'')}')`)
      
    }
    catch (error) {
      l.logDB(`${moment().format('YYYY-MM-DD HH:mm:ss')} (Error al buscar los batchs en ejecucion) Error: ${error}`)
      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')} (Error al buscar los batchs en ejecucion) Error: ${error}`)
    }

    return lstBatch
  }


  return []

}
async function controlFinishBatchsComplete(lst) {
  try {
    console.log("control finish start")

    let lstFinalizados = await lst.filter(it => (it.State == 11 || it.State == 12 || it.State == 13))
    await insertBatchData(lstFinalizados)
    //borrar batchs
    console.log("1")
    lstFinalizados.forEach(it => {
      try {

        insertOpvData(it.OGUID)
        insertFaseData(it.OGUID)
        
        lstFinalizados.subtract(it)
        it.delete()
        // BatchRunning.delete(it)

        console.log("4")
      }
      catch (error) {
        // console.log(error)
        //insert de oguids que fallaron en tabla nueva
        try{
          BatchRejected.createMany(lstFinalizados)

        }
        catch(error){
          console.error('error catch => try : '.error)
        }

      }
    })
  } catch (error) {
    console.error(error)
  }
}
async function insertBatchData(lst) {
  try {
    //Borrar get

    for (let registros = 0; registros < lst.length; registros++) {
      let i = registros

      let limite = i + 3 < lst.length ? 3 : lst.length - i

      let values = ''

      for (i; i < registros + limite; i++) {

        if (values.length > 0) values += ', '

        values += `('${lst[i].ROOTGUID}', ${lst[i].ROOTOBJID}, ${lst[i].ROOTOTID}, '${lst[i].OGUID}', ${lst[i].OBJID}, `
        values += `${lst[i].OTID}, '${lst[i].Name}', ${lst[i].Quantity}, '${lst[i].FormulaCategoryName}', '${lst[i].FormulaName}', `
        values += `'${lst[i].MRecipeName}', '${lst[i].ProductCode}', '${moment(lst[i].ActStart).format()}', '${moment(lst[i].ActEnd).format()}', ${lst[i].State})`

      }
      //Insert aqui
      const firstUserId = await Database
        .raw(`INSERT INTO batchOpt(ROOTGUID,ROOTOBJID,ROOTOTID,OGUID,OBJID,OTID,Name, Quantity,FormulaCategoryName,FormulaName,MRecipeName,ProductCode,ActStart,ActEnd,State)
        VALUES${values}`)
      // console.log(values)
      registros = i - 1
    }

  }
  catch (error) {
    console.log('asd: ', error)
    throw error
  }


}
async function insertFaseData(OGUID) {
  try {
    let vFaseData = await getDataFase(OGUID)

    for (let registros = 0; registros < vFaseData.length; registros++) {
      let i = registros

      let limite = i + 3 < vFaseData.length ? 3 : vFaseData.length - i
      let values = ''

      for (i; i < registros + limite; i++) {


        // const start = vFaseData[i].Start != null ? moment(vFaseData[i].Start).utc().format() : null

        const start = null
        const end = null
        if (vFaseData[i].Start != null) {
          const start = `${moment(vFaseData[i].Start).utc().format()}`
        }
        if (vFaseData[i].End != null) {
          const end = `${moment(vFaseData[i].End).utc().format()}`
        }
        // const end = vFaseData[i].End != null ? moment(vFaseData[i].End).utc().format() : null

        if (values.length > 0) values += ', '

        values += `('${vFaseData[i].ROOTGUID}', ${vFaseData[i].ROOTOBJID}, ${vFaseData[i].ROOTOTID}, ${vFaseData[i].POBJID}, `
        values += `${vFaseData[i].POTID}, '${vFaseData[i].ParentActivationCounter}',${vFaseData[i].OBJID},${vFaseData[i].OTID},${vFaseData[i].ActivationCounter}, `
        values += `'${vFaseData[i].Name}', ${vFaseData[i].State}, ${start}, ${end},`
        values += `${vFaseData[i].DurationPlanned}, ${vFaseData[i].DurationActual}, '${vFaseData[i].UnitName}' ) `

      }
      //Inserte aqui el insert(?
      const firstUserId = await Database
        .raw(`INSERT INTO termTransOpt([ROOTGUID]
          ,[ROOTOBJID]
          ,[ROOTOTID]
          ,[POBJID]
          ,[POTID]
          ,[ParentActivationCounter]
          ,[OBJID]
          ,[OTID]
          ,[ActivationCounter]
          ,[Name]
          ,[State]
          ,[Start]
          ,[End]
          ,[DurationPlanned]
          ,[DurationActual]
          ,[UnitName])
        VALUES${values}`)
      // console.log(values)
      registros = i - 1
    }

  }
  catch (error) {
    console.log('asd: ', error)
    throw error
  }


}
async function insertOpvData(OGUID) {
  try {
    let vOpvData = await getDataOPV(OGUID)

    for (let registros = 0; registros < vOpvData.length; registros++) {
      let i = registros

      let limite = i + 1000 < vOpvData.length ? 1000 : vOpvData.length - i
      let values = ''
      
      for (i; i < registros + limite; i++) {

        if (values.length > 0) values += ', '

        values += `('${vOpvData[i].ROOTGUID}', ${vOpvData[i].P2OBJID}, ${vOpvData[i].P2OTID}, ${vOpvData[i].POBJID}, `
        values += `${vOpvData[i].POTID}, ${vOpvData[i].ActivationCounter},${vOpvData[i].OBJID},`





        let name = vOpvData[i].Name
        name = name == null ? null : `'${vOpvData[i].Name}'`
        values += `${name},`
        values += `${vOpvData[i].sp_float}, `

        values += `${vOpvData[i].av_float}, ${vOpvData[i].sp_int},${vOpvData[i].av_int},`

        let spStr = vOpvData[i].sp_string
        spStr = spStr == null ? null : `'${vOpvData[i].sp_string}'`
        values += `${spStr},`

        let avStr = vOpvData[i].av_string
        avStr = avStr == null ? null : `'${vOpvData[i].av_string}'`
        values += `${avStr},`


        let mName = vOpvData[i].sp_matname
        if (mName != null && mName.includes(`'`))
          mName = mName.replace(`'`, `''`)
        mName = mName == null ? null : `'${mName}'`
        values += `${mName}, `

        let spMc = vOpvData[i].sp_matcode
        spMc = spMc == null ? null : `'${vOpvData[i].sp_matcode}'`
        values += `${spMc},`


        let spEv = vOpvData[i].sp_EnumValue
        spEv = spEv == null ? null : `'${vOpvData[i].sp_EnumValue}'`
        values += `${spEv},`

        let avEv = vOpvData[i].av_EnumValue
        avEv = avEv == null ? null : `'${vOpvData[i].av_EnumValue}'`
        values += `${avEv})\n`

      }

      const firstUserId = await Database
        .raw(`INSERT INTO onlineParameterValueOpt([ROOTGUID]
            ,[P2OBJID]
            ,[P2OTID]
            ,[POBJID]
            ,[POTID]
            ,[ActivationCounter]
            ,[OBJID]
            ,[Name]
            ,[sp_float]
            ,[av_float]
           ,[sp_int]
          ,[av_int]
          ,[sp_string]
          ,[av_string]
          ,[sp_matname]
          ,[sp_matcode]
          ,[sp_EnumValue]
          ,[av_EnumValue])
        VALUES${values}`)
      // console.log(values)

      registros = i - 1
    }

  }
  catch (error) {
    console.log('asd: ', error)
    throw error
  }


}
async function getDataFase(OGUID) {
  try {

    const vFaseData = await Database
      .connection('historian')
      .raw(`SELECT ROOTGUID, ROOTOBJID, ROOTOTID, POBJID, POTID, ParentActivationCounter, OBJID
      ,OTID, ActivationCounter, Name, State, Start, [End], DurationPlanned, DurationActual, UnitName
      FROM [vTermTrans]
      WHERE ROOTGUID = '${OGUID}'`)

    return vFaseData

  }
  catch (error) {
    console.error(error)
    return null
  }
}
async function getDataOPV(OGUID) {
  try {

    const vOPVData = await Database
      .connection('historian')
      .raw(`SELECT sps.ROOTGUID, sps.P2OBJID, sps.P2OTID, sps.POBJID, sps.POTID, sps.ActivationCounter, sps.OBJID,
      sps.Name, sps.sp_float, sps.av_float, sps.sp_int, sps.av_int, sps.sp_string, sps.av_string, sps.sp_matname,
      sps.sp_matcode, sps.sp_EnumValue, sps.av_EnumValue
    FROM [vOnlineParameterValue] as sps
    WHERE ROOTGUID = '${OGUID}'`)

    return vOPVData

  }
  catch (error) {
    console.error(error)
    return null
  }
}
ciclo()