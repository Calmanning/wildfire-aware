const newEcoQuery = ({ mapPoint, fireInformation }) => {

    const url = 'https://services.arcgis.com/jIL9msH9OI208GCb/ArcGIS/rest/services/ConusHexesFirstBatch220623output/FeatureServer/0/query'

    const params = {
      where: '1=1',
      geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.x}, ${mapPoint.y}`,
      geometryType: 'esriGeometryPoint',
      inSR: 4326,
      spatialRelationship: 'intersects',
      distance: 2,
      units: 'esriSRUnit_StatuteMile',
      outFields: ['L3EcoReg', 'LandForm', 'CritHab', 'OwnersPadus', 'RichClass', 'WHPClass', 'PctWater', 'PctSnowIce', 'PctDevelop', 'PctBarren', 'PctForest', 'PctShrub', 'PctGrass', 'PctCropland', 'PctWetlands'].join(','),
      returnGeometry: true,
      outSR: 102100,
      f: 'json'
    }

    axios.get(url, {
      params
    })
      .then((response) => {
        console.log(response.data.features);
        
        const ecoResponse = response.data.features;
        
        const aggragateEcoObj = ecoResponse.reduce((a,b) => {
          Object.keys(b.attributes).forEach(key => {
            
            if(typeof(b.attributes[key]) === 'string'){            
              (a[key] = (a[key] + ', '|| ""  + b.attributes[key])) 
            }

            (a[key] = (a[key] || 0) + b.attributes[key])
          })
          return a
        }, {})
        
        aggragateEcoObj.CritHab = aggragateEcoObj.CritHab.split(', ').filter(entry => !entry.includes(undefined) && !entry.includes("")).reduce((CritHabObj, CritHabItem) => {
          !CritHabObj[CritHabItem] 
          ? CritHabObj[CritHabItem] = 1 
          : CritHabObj[CritHabItem]++
          return CritHabObj
          },{})
        
        aggragateEcoObj.L3EcoReg = aggragateEcoObj.L3EcoReg.split(', ').filter(entry => !entry.includes(undefined)).reduce((L3EcoRegObj, L3EcoRegItem) => {
          !L3EcoRegObj[L3EcoRegItem] 
          ? L3EcoRegObj[L3EcoRegItem] = 1 
          : L3EcoRegObj[L3EcoRegItem]++
          return L3EcoRegObj
        },{})
        
        aggragateEcoObj.LandForm = aggragateEcoObj.LandForm.split(', ').filter(entry => !entry.includes(undefined)).reduce((landformObj, landformItem) => {
          !landformObj[landformItem] 
          ? landformObj[landformItem] = 1 
          : landformObj[landformItem]++
          return landformObj
          },{})

        aggragateEcoObj.OwnersPadus = aggragateEcoObj.OwnersPadus.split(', ').filter(entry => !entry.includes(undefined)).reduce((OwnersPadusObj, OwnersPadusItem) => {
          !OwnersPadusObj[OwnersPadusItem] 
          ? OwnersPadusObj[OwnersPadusItem] = 1 
          : OwnersPadusObj[OwnersPadusItem]++
          return OwnersPadusObj
         },{})
        
        aggragateEcoObj.RichClass = aggragateEcoObj.RichClass.split(', ').filter(entry => !entry.includes(undefined)).reduce((RichClassObj, RichClassItem) => {
          !RichClassObj[RichClassItem] 
          ? RichClassObj[RichClassItem] = 1 
          : RichClassObj[RichClassItem]++
          return RichClassObj
         },{})
        
        aggragateEcoObj.WHPClass = aggragateEcoObj.WHPClass.split(', ').filter(entry => !entry.includes(undefined)).reduce((WHPClassObj, WHPClassItem) => {
          !WHPClassObj[WHPClassItem] 
          ? WHPClassObj[WHPClassItem] = 1 
          : WHPClassObj[WHPClassItem]++
          return WHPClassObj
         },{})
        
        aggragateEcoObj.PctBarren = aggragateEcoObj.PctBarren/ecoResponse.length
        aggragateEcoObj.PctCropland = aggragateEcoObj.PctCropland/ecoResponse.length
        aggragateEcoObj.PctDevelop = aggragateEcoObj.PctDevelop/ecoResponse.length
        aggragateEcoObj.PctForest = aggragateEcoObj.PctForest/ecoResponse.length
        aggragateEcoObj.PctGrass = aggragateEcoObj.PctGrass/ecoResponse.length
        aggragateEcoObj.PctShrub = aggragateEcoObj.PctShrub/ecoResponse.length
        aggragateEcoObj.PctSnowIce = aggragateEcoObj.PctSnowIce/ecoResponse.length
        aggragateEcoObj.PctWater = aggragateEcoObj.PctWater/ecoResponse.length
        aggragateEcoObj.PctWetlands = aggragateEcoObj.PctWetlands/ecoResponse.length
        const totalLandcoverPct = aggragateEcoObj.PctBarren + aggragateEcoObj.PctCropland + aggragateEcoObj.PctDevelop + aggragateEcoObj.PctForest + aggragateEcoObj.PctGrass + aggragateEcoObj.PctShrub + aggragateEcoObj.PctSnowIce + aggragateEcoObj.PctWater + aggragateEcoObj.PctWetlands;
        
        console.log(aggragateEcoObj)
        console.log(totalLandcoverPct)
        const allHexRings = {rings: []};
        const hexPerimeter = response.data.features.map((eachHexGeography) => {    
          allHexRings.rings.push(eachHexGeography.geometry.rings[0]);
        
        });
        
        console.log(allHexRings)
        //renderMapHexes(allHexRings);
      })
  };