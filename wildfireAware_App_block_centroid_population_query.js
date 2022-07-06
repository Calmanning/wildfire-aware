//I've been using axios to make http requests. Here is the CDN, if you need it: https://unpkg.com/axios/dist/axios.min.js

const censusBlockCentroidQuery = ({ mapPoint, fireInformation }) => {

    const url = 'https://services.arcgis.com/jIL9msH9OI208GCb/ArcGIS/rest/services/Populated_Block_Centroids_2020/FeatureServer/0/query'

    const params = {
      where: "1=1",
      geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
      geometryType: 'esriGeometryPoint',      
      spatialRelationship: 'intersects',
      distance: 2,
      units: 'esriSRUnit_StatuteMile',
      inSR: 4326,
      outFields: ['P0010001', 'EstimatedUnder18Pop', 'Estimated18to64Pop', 'Estimated65PlusPop', 'EstPopWithDisability', 'EstPopinPoverty', 'H0010001', 'EstPopNoEnglish', 'EstPopWith0Vehicles'].join(','),
      returnGeometry: true,
      returnQueryGeometry: true,
      f: 'json'
    }

    axios.get(url, {
      params
    })
      .then((response) => {
        console.log(response)

      const aggregatedPopulationBlockObject = response.data.features.reduce((a,b) => {
          Object.keys(b.attributes).forEach(key => {
            a[key] = (a[key] || 0) + b.attributes[key];
        }), 0;
        return a
        },{})

      console.log(aggregatedPopulationBlockObject)
   });
  };