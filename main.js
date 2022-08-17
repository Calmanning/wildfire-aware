
require([
          "esri/config",
          "esri/WebMap",
          "esri/views/MapView",
          "esri/widgets/Search",
          "esri/widgets/Home",
          "esri/widgets/ScaleBar",
          "esri/widgets/Measurement",
          "esri/Graphic",
          "esri/symbols/SimpleLineSymbol",
          "esri/layers/GraphicsLayer",
          "esri/core/reactiveUtils",
          "esri/geometry/Point",
          "esri/geometry/Circle"
], (esriConfig, WebMap, MapView, Search, Home, ScaleBar, Measurement, Graphic, SimpleLineSymbol, GraphicsLayer, reactiveUtils, Point, Circle) => {
    
  'use strict';

  console.log("so far...")
  
// GLOBAL VARIABLES

  //DOM VARIABLES
  const ViewURL = new URL(window.location.href)
  const sideBarContainer = document.querySelector("#sideBar");
  const sideBarTop  = document.querySelector('#sideBarTop');
  const sideBarToggleArrow = document.querySelector('#sideBarToggleArrow');
  const searchWidgetContainer = document.querySelector("#searchContainer");
  const sideBarInformation = document.getElementById('sideBarInformation');
  const fireListEl = document.querySelector('#fire-list');
  const fireListBtn = document.querySelector('#fire-list-Btn');
  const fireListSorting = document.querySelector('#fireSorting');
  const infoItemHeader = document.getElementsByClassName('item-header');
  const infoItemContent = document.getElementsByClassName('item-content');
  const atRiskDiv = document.querySelector('#at-risk-population');
  const fireListDate  = document.getElementsByClassName('fire-list-date')
  const fireListItem  = document.getElementsByClassName('fire-item');
  
  
  //FireList variables
  const dateSortedList = [];
  let personnelSorted = [];
  const sorting = document.querySelectorAll('.sortClass')
  
  //Layer list and associated elements
  const layerList = document.querySelector('#layers');
  const layerListBackground = document.querySelector('#layer-List-Container-background');
  const layerListBtn = document.querySelector('#layer-list-button');
  const firePointsLayerCheckbox = document.querySelector('#fire-points');
  const firePointLegend = document.querySelector('#fire-points-legend')
  const firePermieterLayerCheckbox = document.querySelector('#fire-perimeters');
  const firePerimeterLegend = document.querySelector('#fire-perimeter-legend');
  const watchesAndWarningsCheckbox = document.querySelector('#watchesAndWarnings');
  const watchesAndWarningsLegend = document.querySelector('#watchesAndWarnings-img-legend');
  const satelliteHotspotsCheckbox = document.querySelector('#satellite-hotspots');
  const satelliteHotSpotLegend = document.querySelector('#SatelliteHotSpot-img-legend');
  const AQITodayCheckbox = document.querySelector('#AQI-today');
  const aqiTodayLegend = document.querySelector('#aqiToday-img-legend');
  const AQITomorrowCheckbox = document.querySelector('#AQI-tomorrow');
  const aqiTomorrowLegend = document.querySelector('#aqiTomorrow-img-legend');
  const burnedAreasCheckbox = document.querySelector('#burned-areas');
  const burnedAreasLegend = document.querySelector("#burnedAreas-img-legend");
  const censusPointsCheckbox = document.querySelector('#census-points');
  const censusPointLegend = document.querySelector('#population-points-legend');

  
  let firePoints = {};
  let fireArea = {};
  let firePerimeter = {};
  let weatherWatchesAndWarningsLayer = {};
  let satelliteHotspotsLayer = {};
  let burnedAreasFillLayer = {};
  let burnedAreasPerimeterLayer = {};
  let AQITodayLayer = {};
  let AQITomorrowLayer = {};
  let censusLayer = {};
  

//MAP COMPONENTS

  const webmap = new WebMap({
    portalItem: {
      id: "d4ec5d878d00465cb884a6c610aa5442"
    },
    layers: []
  });

  const mapView = new MapView({
    container: "viewDiv",
    // map: webmap,
    spatialReference: 102100,
    popup: {
      popup: null,
      autoOpenEnabled: false,
    }
  });

  const graphicsLayer = new GraphicsLayer({
    graphics:[]
  })

  webmap.load()
    .then(() => {
      webmap.basemap.load();
    })
    .then(() => {
      mapView.map = webmap;
    })
    .catch((error) => {
      console.log(error)
    })
  

//WIDGETS
  const searchWidget = new Search({
    view: mapView,
    resultGraphicEnabled: false,
    popupEnabled: false,
    container: searchWidgetContainer
  });

  const homeWidget = new Home({
  view: mapView,
  container: homeContainer
  });

  homeWidget.goToOverride = () => {
  resetURLParams()
  return mapView.goTo({ 
                      zoom: 5,
                      center: [260, 39]
                    });
  };
  
  const scaleBar = new ScaleBar({
    view: mapView
  });

const resetURLParams = () => {
  window.location.hash = ""
}

//ON MAP LOAD
  const loadMapview = (() => {
    mapView.when()
      .then(() => {
        console.log('mapView loaded')
      })
      .then(() => {

        firePoints = webmap.allLayers.find((layer) => {
          return layer.title === 'Current Incidents'
        })
        
        firePoints.outFields = [
            'IRWINID',
            'IncidentName', 
            'ModifiedOnDateTime', 
            'FireDiscoveryDateTime', 
            'FireDiscoveryAge', 
            'IncidentTypeCategory', 
            'DailyAcres', 
            'PercentContained'
          ];
        
        fireArea = webmap.allLayers.find((layer) => {
          return layer.title === 'Current Perimeters Fill'
        })
       
        fireArea.outFields = [
          'IrwinID',
          'incidentName',
          'GISAcres',
          'FeatureCategory',
          'IncidentTypeCategory',
          'CurrentDateAge',
          'CreateDate',
          'CreateDateAge',
          'dateCurrent',
        ]

        firePerimeter = webmap.allLayers.find((layer) => {
          return layer.title === 'Current Perimeters Outline'
        });
        firePerimeter.outFields = 'IrwinID';

        weatherWatchesAndWarningsLayer = webmap.allLayers.find((layer) => {
          return layer.title ==='Weather Watches and Warnings'
        });
        
        satelliteHotspotsLayer = webmap.allLayers.find((layer) => {
          return layer.title === 'Satellite Hotspots'
        });

        AQITodayLayer = webmap.allLayers.find((layer) => {
          return layer.title === "Today's AQI Forecast"
        });

        AQITomorrowLayer = webmap.allLayers.find((layer) => {
          return layer.title === "Tomorrow's AQI Forecast"
        });

        burnedAreasFillLayer = webmap.allLayers.find((layer) => {
          return layer.title === 'Burned Areas 1984 - 2020 Fill' 
        });
        
        burnedAreasPerimeterLayer = webmap.allLayers.find((layer) => {
          return layer.title === 'Burned Areas Outline'
        });

        censusLayer = webmap.allLayers.find((layer) => {
          return layer.title === '2020 Census Block Centroids'
        });

      })
      .then(() => {
      //ADD WIDGETS
        mapView.ui.add(searchWidget, "top-left");
        mapView.ui.add(homeWidget, "top-left");
        mapView.ui.add(scaleBar, {position: "bottom-right"});
        webmap.add(graphicsLayer);

      })
      .then(() => {
      //setting up view -- if url-information is relevant have the view reflect that information, otherwise set center on continental US.
          console.log(window.location)  
        if(window.location.hash){
            const newDefaultLocation = window.location.hash.substring(3)
            parseURLHash({newDefaultLocation})
            return
          } 
        initialMapExtent()

      })
      .then(() => {
        layerListBtn.addEventListener('click', (event) => {
          addLayerList(event)
          
        })
      })
      .catch((error) => {
        console.error(error)
      })

  })();

  const addLayerList = (event) => {   
    layerList.style.display === 'none'
    ? (layerList.style.display = 'inherit', layerListBackground.style.background = 'rgb(17, 54, 81)', changelayerListButtonText())
    : (resetLayerList(), layerListBackground.style.background = 'none') 
  }

  const changelayerListButtonText = () => {
    
      layerList.style.display === 'none'
      ? layerListBtn.innerText = 'MAP LAYERS'
      : layerListBtn.innerText = 'CLEAR & CLOSE'
    
  };

  const closeLayerList = () => {

    layerList.style.display = 'none';
    changelayerListButtonText()
  }


//LAYER LIST VISIBILITY TOGGLE

//NOTE: this function is called by all legend-img-divs.
  //NOTE: may need to make the conditioning more explicit
  const toggleLegendDivVisibility = (legendDivId) => {
    if(legendDivId.style.display === "inherit"){
      legendDivId.style.display = "none"
    } else {
      legendDivId.style.display = "inherit"}
  };

  const hideAllLegendDivs = () => {
    satelliteHotSpotLegend.style.display = "none";
    aqiTodayLegend.style.display = "none";
    aqiTomorrowLegend.style.display = "none";
    watchesAndWarningsLegend.style.display = "none";
    burnedAreasLegend.style.display = "none";
    censusPointLegend.style.display = "none";
    
    closeLayerList()
  }

  const enableMapLayer = (enabledLayer) => {
    enabledLayer.removeAttribute("disabled")
    enabledLayer.parentElement.classList.remove('disable')
  };

  const disableMapLayer = (disabledLayer) => {
    disabledLayer.setAttribute("disabled", "")
    disabledLayer.parentElement.classList.add('disable')
    hideLegendDiv(disabledLayer)
  };

  const hideLegendDiv = (disabledLayer) => {
    disabledLayer.checked = false
    disabledLayer.parentElement.nextElementSibling.style.display = 'none';
    
  }


  const toggleFirePointsLayerVisibility = (() => {
    firePointsLayerCheckbox.addEventListener('change', () => {
      firePoints.visible = firePointsLayerCheckbox.checked;
      toggleLegendDivVisibility(firePointLegend);
    });
  })();  

  const toggleFirePerimeterLayerVisibility = (() => {
    
      firePermieterLayerCheckbox.addEventListener('change', () => {
        firePerimeter.visible = firePermieterLayerCheckbox.checked;
        fireArea.visible = firePermieterLayerCheckbox.checked;
        toggleLegendDivVisibility(firePerimeterLegend);
      });
  })();

  const toggleWatchesandWarningsVisibility = (() => {
    
    watchesAndWarningsCheckbox.addEventListener('change', () => {
      weatherWatchesAndWarningsLayer.visible = watchesAndWarningsCheckbox.checked;
      toggleLegendDivVisibility(watchesAndWarningsLegend);

      if(aqiTodayLegend.style.display !== 'none'){
      AQITodayCheckbox.checked = false;
      AQITodayLayer.visible = false;
      toggleLegendDivVisibility(aqiTodayLegend);
      };

      if(aqiTomorrowLegend.style.display !== 'none'){
      AQITomorrowCheckbox.checked = false;
      AQITomorrowLayer.visible = false;
      toggleLegendDivVisibility(aqiTomorrowLegend);
      };

      if(burnedAreasLegend.style.display !== 'none'){
      burnedAreasCheckbox.checked = false;
      burnedAreasFillLayer.visible = false;
      burnedAreasPerimeterLayer.visible = false;
      toggleLegendDivVisibility(burnedAreasLegend);
      };

    });
  })();

  const toggleSatelliteHotSpotsVisibility =  (() => {
    
    satelliteHotspotsCheckbox.addEventListener('change', () => {
      satelliteHotspotsLayer.visible = satelliteHotspotsCheckbox.checked;
      toggleLegendDivVisibility(satelliteHotSpotLegend)
    });
  })()

  const toggleAQITodayVisibility =( () => {
    
    AQITodayCheckbox.addEventListener('change', (event) => {
      AQITodayLayer.visible = AQITodayCheckbox.checked;
      toggleLegendDivVisibility(aqiTodayLegend);

      if(aqiTomorrowLegend.style.display !== 'none'){
      AQITomorrowCheckbox.checked = false;
      AQITomorrowLayer.visible = false;
      toggleLegendDivVisibility(aqiTomorrowLegend);
      };
      
      if(watchesAndWarningsLegend.style.display !== 'none'){
        watchesAndWarningsCheckbox.checked = false;
        weatherWatchesAndWarningsLayer.visible = false;
        toggleLegendDivVisibility(watchesAndWarningsLegend);
      };

       if(burnedAreasLegend.style.display !== 'none'){
      burnedAreasCheckbox.checked = false;
      burnedAreasFillLayer.visible = false;
      burnedAreasPerimeterLayer.visible = false;
      toggleLegendDivVisibility(burnedAreasLegend);
      };

      aqiTodayLegend.visible === true
      ? aqiTodayLegend.parentElement.style.marginBottom = null
      : aqiTodayLegend.parentElement.style.marginBottom = 0;
    });
  })()
  
  const toggleAQITomorrowVisibility = (() => {
  
    AQITomorrowCheckbox.addEventListener('change', () => {
      AQITomorrowLayer.visible = AQITomorrowCheckbox.checked;
      toggleLegendDivVisibility(aqiTomorrowLegend);

      if(aqiTodayLegend.style.display !== 'none'){
      AQITodayCheckbox.checked = false;
      AQITodayLayer.visible = false;
      toggleLegendDivVisibility(aqiTodayLegend);
      };

      if(watchesAndWarningsLegend.style.display !== 'none'){
        watchesAndWarningsCheckbox.checked = false;
        weatherWatchesAndWarningsLayer.visible = false;
        toggleLegendDivVisibility(watchesAndWarningsLegend);
      };

      if(burnedAreasLegend.style.display !== 'none'){
      burnedAreasCheckbox.checked = false;
      burnedAreasFillLayer.visible = false;
      burnedAreasPerimeterLayer.visible = false;
      toggleLegendDivVisibility(burnedAreasLegend);
      };

    });
  })()

  const toggleBurnedAreasVisibility = (() => {

    burnedAreasCheckbox.addEventListener('change', () => {
    burnedAreasFillLayer.visible = burnedAreasCheckbox.checked;
    burnedAreasPerimeterLayer.visible = burnedAreasCheckbox.checked;
    toggleLegendDivVisibility(burnedAreasLegend);
    
      if(aqiTodayLegend.style.display !== 'none'){
        AQITodayCheckbox.checked = false;
        AQITodayLayer.visible = false;
        toggleLegendDivVisibility(aqiTodayLegend);
        };

      if(aqiTomorrowLegend.style.display !== 'none'){
      AQITomorrowCheckbox.checked = false;
      AQITomorrowLayer.visible = false;
      toggleLegendDivVisibility(aqiTomorrowLegend);
      };

      if(watchesAndWarningsLegend.style.display !== 'none'){
        watchesAndWarningsCheckbox.checked = false;
        weatherWatchesAndWarningsLayer.visible = false;
        toggleLegendDivVisibility(watchesAndWarningsLegend);
      };

    });
  })();

  const toggleCensusPopulationVisibility = (() => {
    censusPointsCheckbox.addEventListener('change', () => {
      censusLayer.visible = censusPointsCheckbox.checked;
      toggleLegendDivVisibility(censusPointLegend);
    });
  })();

   const resetLayerList = () => {
    
    resetFirePointsAndPerimeters()
    
    document.querySelectorAll('.auto-checkbox').forEach(checkbox => {
      
      checkbox.checked = false;

      satelliteHotspotsLayer.visible = satelliteHotspotsCheckbox.checked
      AQITodayLayer.visible = checkbox.checked;
      AQITomorrowLayer.visible = checkbox.checked;
      weatherWatchesAndWarningsLayer.visible = watchesAndWarningsCheckbox.checked
      burnedAreasPerimeterLayer.visible = burnedAreasCheckbox.checked
      burnedAreasFillLayer.visible = burnedAreasCheckbox.checked
      censusLayer.visible = censusPointsCheckbox.checked
      
    })
    hideAllLegendDivs();

  };

  const resetFirePointsAndPerimeters = () => {
    if(!firePoints.visible || (!firePerimeter.visible && fireArea.visible)){
      firePoints.visible = true;
      firePerimeter.visible = true;
      fireArea.visible = true;
      firePointsLayerCheckbox.checked = true;
      firePermieterLayerCheckbox.checked = true;
      toggleLegendDivVisibility(firePerimeterLegend);
      toggleLegendDivVisibility(firePointLegend);
    }

  }


//SETTING THE CENTER OF MAP VIEW ON PAGE LOAD. NOTE: is there a better placement in the code for this function?
  const initialMapExtent = () => {
    mapView.goTo({
                    zoom: 5,
                    center: [260, 39]
                  });
  }

  const parseURLHash  = async ({newDefaultLocation}) => {
    
    const URLLocationParams = newDefaultLocation.split(',')
    console.log(URLLocationParams)

    const URLLocationCoordinates = {
      x: URLLocationParams[0],
      y: URLLocationParams[1]
    }
    
    const mapPoint = new Point(
      URLLocationCoordinates
    )
    
      console.log(URLLocationParams[3].length)

    if(URLLocationParams[3] && URLLocationParams[3] === 'loc'){
      //use URLLocationCoordinates to query location info
        queryHub({ mapPoint });
        newEcoQuery({ mapPoint });
        censusBlockCentroidQuery({ mapPoint });
        addCircleGraphic({mapPoint})
        // updateURLParams({mapPoint})
    } else if (URLLocationParams[3] && URLLocationParams[3].length >= 35){
      //use irwinID to collect fire info and use that to collect the surrounding information.
      const irwinID = URLLocationParams[3]
      selectedFireInfoQuery({irwinID})
    } else{   
      await goto({ mapPoint })

      setTimeout(() => {URLLocationParams[2] !== '12' ? mapView.zoom = URLLocationParams[2] : null;}, 1000)
    }
  }

//MAP GRAPHIC(S)
  
  
const circle = new Graphic({
      
      symbol: {
        type: 'simple-fill',
        color: [0,0,0,0],
        outline: new SimpleLineSymbol ({
        color: [255, 186, 31, 1],
        style: "long-dash",
        width: 2
        }),
      }
    });


  

//MAP POINT GRAPHIC FUNCTION
  const addCircleGraphic = async ({mapPoint, fireLocation}) => {    
    console.log(mapPoint)

    console.log('add a circle please')
    
    const circleGeometry = new Circle({
    center: mapPoint || fireLocation,
    geodesic: true,
    numberOfPoints: 200,
    radius: 2,
    radiusUnit: "miles",
  });
    
    circle.symbol.outline.style = mapView.zoom < 8 ? "solid" : "long-dash"
    circle.geometry = circleGeometry


    mapView.graphics.add(circle);
    
    console.log(mapView.graphics)
  };

  const removeCircleGraphic = async () => {
    mapView.graphics.removeAll();
    
  }


//RENDER CENSUS SELECTED TRACT

  const fireGraphic = async ({fireIconGraphicInfo, fireInformation}) => {
    console.log(fireIconGraphicInfo ? 'fire object' : 'array with coordinates')
    console.log(fireIconGraphicInfo || fireInformation)
    const fireLocation = fireInformation 
                         ? fireInformation[0].split(',')
                         : fireIconGraphicInfo.geometry;
console.log(fireLocation)                         
                         
    const fireType = fireInformation
                   ? fireInformation[2]
                   : fireIconGraphicInfo.attributes.incidentType;

    const firePersonnelSize = fireInformation    
                   ? fireInformation[3].split(' ')[0]
                   : fireIconGraphicInfo.attributes.TotalIncidentPersonnel;
console.log(firePersonnelSize)                   
await removePreviousFireIcon()
setTimeout(() => {
    const fireIconGraphic =  new Graphic ({
      geometry: {
        type: 'point',
        x: fireLocation.x || +fireLocation[0],
        y: fireLocation.y || +fireLocation[1],
      },
      symbol: {
      type: "simple-marker",
      size: 17,
      color: [17, 54, 81, 1],
      outline: {
        width: 2,
        color: [255, 186, 31]
        }
      }
  });

  
  // if(fireType !== 'RX' || 'PERSCRIPTTION BURN') {
  //     fireIconGraphic.symbol.size = 30
      if(firePersonnelSize > 500){
          fireIconGraphic.symbol.size = 40
        } else if (firePersonnelSize < 500){
          fireIconGraphic.symbol.size = 30
        } else if (firePersonnelSize < 50 || NaN){
          fireIconGraphic.symbol.size = 17
        }
    // }
    
    webmap.layers.reorder(graphicsLayer, 12)
    graphicsLayer.graphics.push(fireIconGraphic);
    console.log(graphicsLayer)
  },0.1)
    
  }
  
  const removePreviousFireIcon = async () => {
    console.log('remove grphic called')
    graphicsLayer.graphics
    ? graphicsLayer.graphics.pop()
    : null;

  }

const goto = async ({ mapPoint }) => {
  console.log('ADJUSTING MAP EXTENT')
  console.log(mapPoint);

    if (mapView.zoom >= 8 ) {
      return
    }
    
    const point = new Point(
      {
        x:  mapPoint.x, 
        y:  mapPoint.y
      }
    )
  
  console.log(point)
  mapView.goTo(
    {
      zoom: 12,
      target: mapPoint
    },
    {
      duration: 1000
    }
  )
    .catch((error) => {
      console.error(error)
      
    });
  };

//FORMATTING THE FIRST ENTRY IN THE FIRE LIST
  const formatFirstFireItem = () => {
    fireListItem[0].style.marginTop = '39px';
  };

//List of fires in dropdown
  const formatActiveFires = (sortedFireList) => {
    // console.log(sortedFireList)
  
  // const personnelSubheader =  while(sorting[0].style.textDecoration){
  //   return 'personnel'
  // }

  const fires = sortedFireList.map(fire => {
    
    if(typeof(fire) === 'object') {
      
    const fireListItem = {
      fireName: fire[0]
              ? fire[0].attributes.IncidentName.toUpperCase()
              : fire.attributes.IncidentName.toUpperCase(),
      fireId: fire[0]
              ? fire[0].attributes.IrwinID
              : fire.attributes.IrwinID,
      fireAcres: fire[0]
              ? `${fire[0].attributes.DailyAcres.toLocaleString()} acres`
              : `${fire.attributes.DailyAcres.toLocaleString()} acres`,
      firePersonnel: fire[0]
              ? fire[0].attributes.TotalIncidentPersonnel
              : fire.attributes.TotalIncidentPersonnel,
      fireLocation: fire[0]
              ? [fire[0].geometry.x, fire[0].geometry.y]
              : [fire.geometry.x, fire.geometry.y],
      fireType: fire[0]
              ? fire[0].attributes.IncidentTypeCategory
              : fire.attributes.IncidentTypeCategory,
    }

    // const acreSubheader = `{fireListItem.fireAcres.toLocaleString()} acres`;
    // const personnelSubheader = `{fireListItem.firePersonnel.toLocaleString()} personnel`
    
    return  (
      `
      <div class = "fire-item padding-left-2" style = "margin-bottom: 15px; cursor: pointer;" value="${fireListItem.fireLocation}, ${fireListItem.fireId}, ${fireListItem.fireType}, ${fireListItem.firePersonnel}" > 
        <h5 style ="font-weight: bold; margin-bottom: -4px; color: #ffb600; line-height: 21px;" value="${fireListItem.fireLocation}, ${fireListItem.fireId}, ${fireListItem.fireType}, ${fireListItem.firePersonnel}">${fireListItem.fireName} </h5>
        
        <p value="${fireListItem.fireLocation}, ${fireListItem.fireId}, ${fireListItem.fireType}, ${fireListItem.firePersonnel}">${sorting[0].style.textDecoration ? fireListItem.firePersonnel : fireListItem.fireAcres}</p>
        
      </div>
      `
      );
    }
    
    return `<p class = "trailer-0 fire-list-date" style = "margin-top: 1rem; cursor: default;">${fire.toUpperCase()}</p>`; 

  });

  document.getElementById('fire-list').innerHTML = [...fires].join("");

    // fireListItemClickEvent() 
    fireItemEvents()     
    // fireDateEdit()
};



//TODO: change this function name. Too common. Not descriptive.
  const setFireContentInfo =  ({ fireData }) => {
  console.log(fireData)

    const recentFireData = new Date(fireData.modifiedOnDateTime).toLocaleDateString(undefined,{month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric'});

    const fireDate = new Date(fireData.fireDiscoveryDateTime).toLocaleDateString(undefined,{hour: 'numeric', minute: 'numeric', month: 'long', day: 'numeric', year: 'numeric'});
    
    const fireAge = fireData.fireDiscovery;
    
    const fireName = fireData.incidentName.toUpperCase();

    const fireAcres = fireData.dailyAcres;

    const firePersonnel = fireData.personnelAssigned.toLocaleString()
    
    const fireType = fireData.incidentType;
    
    const fireIcon = ({ fireType , fireAge }) => {
      console.log(fireAge)
      if(fireType == 'WILDFIRE' && (fireAge>1)) {
      return "https://www.arcgis.com/sharing/rest/content/items/3ce2a29d3c794e288b24fcd39ed1f966/data"
     } else if (fireType === 'WILDFIRE') {
      return "https://www.arcgis.com/sharing/rest/content/items/f5ae5a1952d140f9b9c4c5c6ed9ad5da/data"
      } else if (fireType === 'INCIDENT COMPLEX') {
        return "https://www.arcgis.com/sharing/rest/content/items/f5ae5a1952d140f9b9c4c5c6ed9ad5da/data"
      } else {
      return "https://www.arcgis.com/sharing/rest/content/items/83e1078b2faf42309b73ba46bd86f1b8/data"
      }
    }
  //NOTE: Should I separate these variable from the HTML formatting below...probably


    const fireHeader = infoItemHeader[0].innerHTML = `
                          <p class = "trailer-0 sectionHeader">FIRE INFORMATION</p>
                          <p class="sectionSubHeader">CURRENT AS OF:  ${recentFireData.toUpperCase()} </p>`
                      

    infoItemContent[0].setAttribute('style', 'display: inline')

    const fireTitleInfo =  infoItemContent[0].innerHTML = `
          <div style="display: inline-flex; margin-top: -5px;">
              <img src= ${fireIcon({fireType, fireAge})} 
                style="width:64px; height:64px;" 
                viewbox="0 0 32 32" 
                class="svg-icon" 
                type="image/svg+xml"/>
              <div>
                <h4 class = "bold trailer-0" style= "line-height: 0px;"><b>${fireName}</b></h4>
                <p class = "trailer-0" style = "font-size: 0.875rem;" >INCIDENT TYPE: ${fireType}</p>
                <p class = "trailer-0" style = "font-size: 0.875rem; white-space:nowrap" >START: ${fireDate.toUpperCase()}</p>
              </div>
          </div>
          
          <div>
            <div class = "trailer-0 " style= "margin-top: 10px;"> 
              <span style = "vertical-align: 2px; margin: 0 5px 0px 103px"> DAY </span> <h4 class = "bold trailer-0" style = "white-space: nowrap;"> ${window.screen.width > 700 ? fireAge : '< 24 hours'}</h4>
            </div>
            <div class = "trailer-0 " style= "margin-top: 10px;"> 
              <span style = "vertical-align: 2px; margin: 0 5px 0px 45px;"> PERSONNEL </span> <h4 class = "bold trailer-0" style = "white-space: nowrap;"> ${firePersonnel}</h4>
            </div>
            <div class = "trailer-0" style = "margin: 5px auto;">
              <span style = "vertical-align: text-bottom; margin: 0 5px 0px 5px"> REPORTED ACRES </span> <h4 class = "bold trailer-0"> ${fireAcres ? fireAcres.toLocaleString() : 'Not reported'}</h4>
            </div>
          </div>
          <div id = 'containment' style = 'display:inline-flex'>
            <p class = "trailer-0" style="margin-top: 5px;">
              <span style = "vertical-align: text-bottom; margin: 0 5px 0 23px;">CONTAINMENT</span>
              <span id = "containment-text"></span>
            </p>
            </div>
          `;

    fireHeader
    fireTitleInfo
    
    containmentBar(fireData.percentContained)
    
  };

//EVENT LISTENERS

  reactiveUtils.when(
    () => mapView?.stationary, 
    () => {
      const extentGeometry = mapView.extent
      console.log(extentGeometry)
      getFiresByExtent({ extentGeometry })

    }
  )

  reactiveUtils.watch(
    () => mapView?.zoom,
    async () => {
      console.log(`zoom changed to ${mapView.zoom}`);
      if(!(mapView.zoom >= 0 && mapView.zoom <= 9)){
        disableMapLayer(AQITodayCheckbox)
        disableMapLayer(AQITomorrowCheckbox)
        AQITodayLayer.visible = AQITodayCheckbox.checked
        AQITomorrowLayer.visible = AQITodayCheckbox.checked
        if(aqiTodayLegend.style.display === 'intitial' || aqiTomorrowLegend.style.display === 'intitial')
        toggleLegendDivVisibility(aqiTodayLegend || aqiTomorrowLegend)

      } else {
        if(AQITodayCheckbox.attributes.disabled || AQITomorrowCheckbox.attributes.disabled){
          enableMapLayer(AQITodayCheckbox)
          enableMapLayer(AQITomorrowCheckbox);
        }
      }
      
      if(!(mapView.zoom >= 0 && mapView.zoom <= 9)){
        disableMapLayer(watchesAndWarningsCheckbox)
        weatherWatchesAndWarningsLayer.visible = watchesAndWarningsCheckbox.checked
      }else{
        enableMapLayer(watchesAndWarningsCheckbox)
      }

      if(!(mapView.zoom >= 7)){
        disableMapLayer(satelliteHotspotsCheckbox)
        satelliteHotspotsLayer.visible = satelliteHotspotsCheckbox.checked
        
      }else{
        enableMapLayer(satelliteHotspotsCheckbox)
      }
      
      if(!(mapView.zoom >= 9 && mapView.zoom <= 11)){
        disableMapLayer(burnedAreasCheckbox)
        burnedAreasFillLayer.visible = burnedAreasCheckbox.checked
        burnedAreasPerimeterLayer.visible = burnedAreasCheckbox.checked
      }else{
        enableMapLayer(burnedAreasCheckbox)
      }

      if(!(mapView.zoom >= 12 && mapView.zoom <= 15)){
        disableMapLayer(censusPointsCheckbox)
        censusLayer.visible = censusPointsCheckbox.checked
      }else{
        enableMapLayer(censusPointsCheckbox)
      }
      
      if(mapView.zoom <= 9 && mapView.graphics.items.length > 0 && graphicsLayer.graphics.items.length > 0){
        console.log(mapView.graphics)
        console.log(graphicsLayer)
        const solidCircle = circle.clone()
        solidCircle.symbol.outline.style = "solid"
        // solidCircle.symbol.outline.visible = false
        
        await removeCircleGraphic()

        mapView.graphics.add(solidCircle)
        mapView.graphics.items[0].visible = false
        
      }else if(mapView.zoom >= 10 && mapView.graphics.items.length > 0 && graphicsLayer.graphics.items.length > 0) {
        console.log('make long dash')
         const longDashCircle = circle.clone()
         longDashCircle.symbol.outline.style = "long-dash"
        //  solidCircle.symbol.outline.visible = true
        
         await removeCircleGraphic()

        mapView.graphics.add(longDashCircle)
        mapView.graphics.items[0].symbol.outline.style = "long-dash"
        mapView.graphics.items[0].visible = true
      } else if (mapView.zoom <= 8 && mapView.graphics.items.length > 0 && graphicsLayer.graphics.items.length === 0){
        
        const solidCircle = circle.clone()
        solidCircle.symbol.outline.style = "solid"
        // solidCircle.symbol.outline.visible = false
        
        await removeCircleGraphic()

        mapView.graphics.add(solidCircle)
      } else if (mapView.zoom >= 9 && mapView.graphics.items.length > 0 && graphicsLayer.graphics.items.length === 0){
        
        const longDashCircle = circle.clone()
        longDashCircle.symbol.outline.style = "long-dash"
        // longDashCircle.symbol.outline.visible = false
        
        await removeCircleGraphic()

        mapView.graphics.add(longDashCircle)
      } 
    });


  searchWidget.on('search-complete', event => {
    console.log(event)
    const location = event.results[0].results[0].feature.geometry
    console.log(location)
    
  });

  mapView.on('click', async (event) => {
    
    await removeCircleGraphic()

    await removePreviousFireIcon();

    console.log(event)

    mapHitTest(event)

  });

  const mapHitTest = (event) => {

    let feature;
    
    mapView.hitTest(event, { include: [firePoints, fireArea, firePerimeter]}).then((hitResponse) => {
      console.log('hitTest')
      console.log(event)
      if(hitResponse.results.length) {
        feature = hitResponse.results.filter((result) => {
          console.log(result)
          return result.graphic;
        })[0].graphic;
        console.log(feature.layer.renderer)
        const mapPoint = feature.geometry.centroid 
                       ? event.mapPoint 
                       : feature.geometry;
        const hitTestResponse = feature.attributes

        console.log(feature)
        console.log(feature.sourceLayer.title)
        feature.sourceLayer.title.includes('Current Incidents')
        ? (selectedFireInfoQuery({hitTestResponse}))
        : (selectedFireInfoQuery({hitTestResponse}));
        
      } else {
        infoItemHeader[0].innerHTML = '';
        infoItemContent[0].innerHTML = '';
        const mapPoint = event.mapPoint;
        console.log(mapPoint)
        queryHub({ mapPoint });
        newEcoQuery({ mapPoint });
        censusBlockCentroidQuery({ mapPoint });
        addCircleGraphic({mapPoint})
        updateURLParams({mapPoint})
      };

    })
  }

  const updateURLParams = ({mapPoint, irwinIdNumber}) => {
    console.log('URL stuff')
    console.log(mapPoint)
    
    // ViewURL.searchParams.set(`@`, `${mapPoint.x}, ${mapPoint.y}`)
    ViewURL.hash = `@=${mapPoint.longitude.toFixed(3)},${mapPoint.latitude.toFixed(3)},${mapView.zoom <= 8 ? 12 : mapView.zoom},${irwinIdNumber ? irwinIdNumber :'loc'}`
    console.log(ViewURL)
    console.log(ViewURL.hash)
    console.log(document.URL)
    return window.location.href = ViewURL.hash.toString()
  }

  fireListBtn.addEventListener('click', async () => {
    fireListDisplayToggle(); 
    
    await removeCircleGraphic()
    await removePreviousFireIcon();
    
    resetURLParams()
    resetFireList();
    sideBarInformation.style.display = 'none'
  })

  const fireListDisplayToggle = (mapPoint) => {
    
    fireListEl.style.display === 'initial' || (mapPoint && fireListEl.style.display)
    ? (fireListEl.style.display = 'none', fireListBtn.style.display = 'initial', sideBarInformation.style.display = 'initial', scrollToTop(), fireListSorting.style.display = 'none')
    : (fireListEl.style.display = 'initial', fireListBtn.style.display = 'none', sideBarInformation.style.display = 'none', fireListSorting.style.display = 'initial');
    
  }

  const returnToTopBtnClick = (() => {
    document.querySelector('#return-top-Btn').addEventListener('click', () => {
    
      scrollToTop()
    })
  })()

  const scrollToTop = () => {
    document.querySelector('#infoBar').scrollTo(0,0)
  }

  const sideBarToggleView = (() => {
    sideBarTop.addEventListener('click', () => {
      
      if (sideBarContainer.style.height === '100%') {
        sideBarContainer.style.height = '0'
        sideBarToggleArrow.style.transform = 'rotate(0deg)'
        console.log('toggle side bar down')
      } else {
        sideBarContainer.style.height = '100%'
        sideBarToggleArrow.style.transform = 'rotate(180deg)'
        console.log('toggle side bar up')
      }
    })
  })()

  //Different Ways to sort the fire list
  const sortingOptions = ({ dateSorted, wildFires }) => {
    const wildFiresToSort = wildFires
    console.log(wildFires)
    dateSortedList.push(dateSorted)

    let sortingAcrage = [];
    [...sortingAcrage] = wildFires.map(fire => (
      
       Object.assign (fire, {acreSorting: +fire.attributes.DailyAcres
        ? fire.attributes.DailyAcres
        : 0})
      
      ))
      
      let nameSorted = [...wildFiresToSort]
      nameSorted = nameSorted.sort((a,b) => {
        let fireNames = a.attributes.IncidentName.trim().localeCompare(b.attributes.IncidentName.trim());
        return fireNames
      });
      
      
      let acreSorted = [...wildFiresToSort]
      acreSorted = sortingAcrage.sort((a,b) => {
        let fireAcres = b.acreSorting - a.acreSorting;
        return  fireAcres
      });

      personnelSorted = [...wildFiresToSort];
      personnelSorted = wildFiresToSort.sort((a,b) => {
        const personnelAssigned = b.attributes.TotalIncidentPersonnel - a.attributes.TotalIncidentPersonnel;
        return personnelAssigned
      })
      personnelSorted.map((personnelFire) => {
        personnelFire.attributes.TotalIncidentPersonnel = !personnelFire.attributes.TotalIncidentPersonnel || null ? 'Not reported' : `${personnelFire.attributes.TotalIncidentPersonnel.toLocaleString()} personnel`;
        console.log(personnelFire.attributes.TotalIncidentPersonnel)
      })
    
    sorting.forEach((sortCategory) => {
      if(sortCategory.innerText.includes('PERSONNEL') && sortCategory.style.textDecoration){
          formatActiveFires(personnelSorted)
          formatFirstFireItem()
      }else if(sortCategory.innerText.includes('DATE') && sortCategory.style.textDecoration){
          formatActiveFires(dateSorted)
      } else if (sortCategory.innerText.includes('NAME') && sortCategory.style.textDecoration){
            formatActiveFires(nameSorted)
            formatFirstFireItem()
      } else if (sortCategory.innerText.includes('SIZE') && sortCategory.style.textDecoration){
            formatActiveFires(acreSorted)
            formatFirstFireItem()
        }
    })

    renderFireListClickEvent({personnelSorted, dateSorted, nameSorted, acreSorted })

  }

  //click event to re-render list in new order
  const renderFireListClickEvent = ({personnelSorted, dateSorted, nameSorted, acreSorted }) => {
      
    sorting.forEach((sortCategory) => {
      sortCategory.addEventListener('click', (event) => {
        console.log(event)
        console.log(event.target.innerText)
        !event.target.style.textDecoration
        ? (sorting.forEach((item) => {
                                      item.style.textDecoration = '', 
                                      item.style.color=''}), 
                                      event.target.style.textDecoration = 'underline #ffb600 3px', 
                                      event.target.style.textUnderlinePosition = 'under',
                                      event.target.style.textUnderlineOffset = '2px'
          )
        : null;

        if(event.target.innerText.includes('PERSONNEL')){
          formatActiveFires(personnelSorted)
          formatFirstFireItem()
        }else if(event.target.innerText.includes('DATE')) {
          formatActiveFires(dateSorted)
        } else if (event.target.innerText.includes('NAME')) {
            formatActiveFires(nameSorted)
            formatFirstFireItem()
        } else if (event.target.innerText.includes('SIZE')) {
            formatActiveFires(acreSorted)
            formatFirstFireItem()
        }
      })

    })
  };

  const resetFireList = () => {
    document.querySelectorAll('.sortClass').forEach((sortCategory) => {
      sortCategory.style.textDecoration = '', sortCategory.style.color = '#efefef'
    })

    document.querySelector('#fire-personnel').style.textDecoration = 'underline'
    document.querySelector('#fire-personnel').style.textUnderlinePosition = 'under'
    document.querySelector('#fire-personnel').style.color='#ffb600'

    formatActiveFires(personnelSorted)
    formatFirstFireItem()
  }

  const firesInView = (number) => {

    const firesInViewEl = document.getElementById('firesInView')

    const fireSpan = `<span style="font-size: 1rem; font-weight: bold; color: #FFBA1F; margin-right: 5px;"> ${number} </span> <span>FIRES IN VIEW</span>`;

    firesInViewEl.innerHTML = fireSpan
  }

//Functions Hub for REST calls 
//querys called from Map click
  const queryHub = ({ mapPoint }) => {
      mapPoint ? console.log(mapPoint) : console.log(fireInformation)

      mapPoint 
      ? fireListDisplayToggle(mapPoint)
      : fireListDisplayToggle(); 
      
      goto({ mapPoint });

      renderWeatherHeader()
        
      currentDroughtQuery({ mapPoint });

      weatherCollection({ mapPoint })
        clearWeatherGrid()

  }

  const getFiresByExtent = ({ extentGeometry }) => {
    const url = 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/USA_Wildfires_v1/FeatureServer/0/query'
    
    const params = {
            where: `1=1`,
            time: null,
            geometry: extentGeometry,
            geometryType: 'esriGeometryEnvelope',
            spatialRelationship: 'intersects',
            inSR: 3857,
            returnGeometry: true,
            returnQueryGeometry: true,
            outFields:[
              'IrwinID', 
              'IncidentName',
              'POOState', 
              'ModifiedOnDateTime', 
              'FireDiscoveryDateTime', 
              'FireDiscoveryAge', 
              'IncidentTypeCategory', 
              'DailyAcres', 
              'PercentContained',
              'TotalIncidentPersonnel' 
            ].join(','),
            f:'json'
      }
      axios.get(url, {
        params
      })
        .then((response) => {
        const wildFires = response.data.features
      
         let fires = wildFires.map(fire => (
          { fire,
            monthDay: new Date(fire.attributes.FireDiscoveryDateTime).toLocaleString('default', {month: 'long', day: 'numeric'}),
            sortDate: fire.attributes.FireDiscoveryDateTime
          }
        ));
      
        fires = fires.sort((a,b) => {
          let fireOrder = b.sortDate - a.sortDate;
      
          return fireOrder
        })
        

        let groupedFires = {};
        fires.forEach(fireObject => {
          if(!groupedFires[fireObject.monthDay]) {
            groupedFires[fireObject.monthDay] = []
          }

          groupedFires[fireObject.monthDay].push(fireObject)
        });

        let dateSorted = [];
        Object.keys(groupedFires).forEach(dateKey => {
          
          let dateHeader = `${dateKey}`;
          dateSorted.push(dateHeader);
          
          
          groupedFires[dateKey].forEach(data => {
            
            data.fire.attributes.DailyAcres = data.fire.attributes.DailyAcres
                                            ? +data.fire.attributes.DailyAcres
                                            : 'Unreported'
            dateSorted.push([data.fire])
          });
          
        });

        
        sortingOptions({ dateSorted, wildFires });
        firesInView(response.data.features.length);
      })
          .catch((error) => {
            console.error(`query Error: ${error}`)
      });
    };

    const fireItemEvents = () => {
      document.querySelectorAll('.fire-item').forEach(item => {
         item.addEventListener("click", (event) => {

      console.log(`fire clicked ${event.target.attributes.value.value}`)
      const fireInformation = event.target.attributes.value.value.split(', ')
      
      const irwinID = fireInformation[1]; 
      
      selectedFireInfoQuery({irwinID}); //collects the selected fires information and ALSO renders it to the sidebar 
      
      });
        
        item.addEventListener("mouseenter", (event) => {
          console.log(`fire hover ${event.target.attributes.value.value}`)    
          
          const fireInformation = event.target.attributes.value.value.split(', ')

          fireGraphic({ fireInformation })
        }),

        item.addEventListener("mouseleave", (event) => {
          console.log('mouseout')
          removePreviousFireIcon();
        })
      });
    };


 //query calls from clicking on a list of active fires
  // const fireListItemClickEvent = async () => { 
  // document.querySelectorAll(".fire-item").forEach(item => {
  //   item.addEventListener("click", (event) => {

  //     console.log(`fire clicked ${event.target.attributes.value.value}`)
  //     // removePreviousFireIcon();
  //     const fireInformation = event.target.attributes.value.value.split(', ')
      
  //     const irwinID = fireInformation[1]; 
      
  //     selectedFireInfoQuery({irwinID}); //collects the selected fires information and ALSO renders it to the sidebar 

  //     // queryHub({ fireInformation });
      
  //     });
  //   });
  // }; 
   
  const selectedFireInfoQuery = ({hitTestResponse, irwinID}) => {
    
    const url = 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/USA_Wildfires_v1/FeatureServer/0/query'

    const irwinIdNumber = hitTestResponse 
          ? hitTestResponse.IrwinID || hitTestResponse.IRWINID.replace(/[{}]/g, "")
          : irwinID;

          console.log(irwinIdNumber);

    const params = {
      where: `IrwinId ='${irwinIdNumber}'`,
      time: null,
      outFields: ['IrwinID', 'IncidentName', 'ModifiedOnDateTime', 'FireDiscoveryDateTime', 'FireDiscoveryAge ', 'IncidentTypeCategory', 'DailyAcres', 'TotalIncidentPersonnel','PercentContained'].join(","),
      returnGeometry: true,
      outSR: 4326,
      f: 'json'
    };

    axios.get(url, {
      params
    })
      .then((response) => {
        console.log(response)
        console.log(response.data.features)
        const fireIconGraphicInfo = response.data.features[0]
        
        const incidentType = response.data.features[0].attributes.IncidentTypeCategory !== "WF" 
        ? response.data.features[0].attributes.IncidentTypeCategory !== "RX"
          ? 'INCIDENT COMPLEX' : 'PERSCRIPTTION BURN'
        : 'WILDFIRE'
        const mapPoint = new Point(
        
          response.data.features[0].geometry
        )
        
        console.log(mapPoint)
        const fireData = response.data.features[0]
          ? {
              irwinId: response.data.features[0].attributes.IrwinID,
              incidentName: response.data.features[0].attributes.IncidentName,
              fireDiscovery: response.data.features[0].attributes.FireDiscoveryAge === 0 ? 'Less than 24 hours' : response.data.features[0].attributes.FireDiscoveryAge,
              fireDiscoveryDateTime: response.data.features[0].attributes.FireDiscoveryDateTime,
              modifiedOnDateTime: response.data.features[0].attributes.ModifiedOnDateTime,
              incidentType: incidentType,
              dailyAcres: response.data.features[0].attributes.DailyAcres === null ? 'Not reported': response.data.features[0].attributes.DailyAcres,
              personnelAssigned: !response.data.features[0].attributes.TotalIncidentPersonnel ? 'Not reported': response.data.features[0].attributes.TotalIncidentPersonnel,
              percentContained: response.data.features[0].attributes.PercentContained === null ? 'Not reported' : response.data.features[0].attributes.PercentContained
            }
        //DO I NEED THIS ANY MORE? I'M NOT RELYING ON HITTEST INFO, Right?
          : {
            irwinId: hitTestResponse.IrwinID,
            incidentName: hitTestResponse.IncidentName,
            fireDiscovery: hitTestResponse.CurrentDateAge,
            fireDiscoveryDateTime: hitTestResponse.CreateDate,
            modifiedOnDateTime: hitTestResponse.DateCurrent,
            incidentType: hitTestResponse.incidentType,
            personnelAssigned: DailyAcres === null ? 'Not reported': response.data.features[0].attributes.TotalIncidentPersonnel,
            percentContained: 'Not reported'
          }
          
        setFireContentInfo({ fireData })
        queryHub({ mapPoint })
        populationAndEcologyPerimeterQuery({ irwinIdNumber,  mapPoint})
        fireGraphic({ fireIconGraphicInfo })
        updateURLParams({mapPoint, irwinIdNumber})
      })
        .catch((error) => {
          console.log(error)
        })
  };

  const populationAndEcologyPerimeterQuery = async ({ irwinIdNumber, mapPoint }) => {
    
    const url ='https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/Wildfire_aggregated_v1/FeatureServer/1/query';

    console.log(irwinIdNumber)

    const params = {
      where: `irwinID = '{${irwinIdNumber}}'`,
      geometryType: 'esriGeometryPoint',      
      spatialRelationship: 'intersects',
      distance: 2,
       units: 'esriSRUnit_StatuteMile',
      inSR: 3857,
      outFields: '*',
      returnGeometry: true,
      returnQueryGeometry: true,
      f: 'json'
    }

    axios.get(url, {
      params
    })
      .then((response) => {
        console.log(response)
        
        const consolidatedFirePerimeterData = response.data.fields ? response.data.features[0].attributes : false 
        console.log(consolidatedFirePerimeterData)
        
        !consolidatedFirePerimeterData
        ? console.log('no data')
        : (console.log('yes there is perimeter data'));
        
        if(consolidatedFirePerimeterData){
          console.log(consolidatedFirePerimeterData);
          
          const populationData =[{'data': consolidatedFirePerimeterData.sum_estimated0_14pop ? consolidatedFirePerimeterData.sum_estimated0_14pop : 0 , name: '< 14'}, {'data': consolidatedFirePerimeterData.sum_estimated15_17pop ? consolidatedFirePerimeterData.sum_estimated15_17pop : 0, name: '15-17'}, {'data': consolidatedFirePerimeterData.sum_estimated18to64pop ? consolidatedFirePerimeterData.sum_estimated18to64pop : 0, name: '18-64'},{'data': consolidatedFirePerimeterData.sum_estimated65_79pop ? consolidatedFirePerimeterData.sum_estimated65_79pop : 0, 'name': '65-79'},{'data': consolidatedFirePerimeterData.sum_estimated80pluspop ? consolidatedFirePerimeterData.sum_estimated80pluspop : 0 , 'name': '+ 80'}]; 
          const perimeterPopulationWithVehicle = {value: parseFloat(100 - (consolidatedFirePerimeterData.sum_estpopwith0vehicles/consolidatedFirePerimeterData.sum_p0010001) * 100).toFixed(1)}
          const perimeterPopulationSpeakingEnglish = {value: parseFloat(100 - (consolidatedFirePerimeterData.sum_estpopnoenglish/consolidatedFirePerimeterData.sum_p0010001)*100).toFixed(1)}
          const perimeterWeightedMedianHousing = Math.round(consolidatedFirePerimeterData.sum_weightedmedianhomevalue/consolidatedFirePerimeterData.sum_h0010001)
          
          const perimeterHousingData = {
            TotalHousingUnits: consolidatedFirePerimeterData.sum_h0010001 ? consolidatedFirePerimeterData.sum_h0010001.toLocaleString() : 'No housing data',
            MedianValue: consolidatedFirePerimeterData.sum_weightedmedianhomevalue ? `$${perimeterWeightedMedianHousing.toLocaleString()}` : 'No housing data'
          }

          const perimeterPopulation = {
            totalPopulation: consolidatedFirePerimeterData.sum_p0010001 ? consolidatedFirePerimeterData.sum_p0010001.toLocaleString() : 'No data',
            percentofPopulationInPoverty: consolidatedFirePerimeterData.sum_estpopinpoverty = consolidatedFirePerimeterData.sum_estpopinpoverty ? `${parseFloat(consolidatedFirePerimeterData.sum_estpopinpoverty/consolidatedFirePerimeterData.sum_p0010001*100).toFixed(0)}%` : 'No data',
            percentofPopulationWithDisability: consolidatedFirePerimeterData.sum_estpopwithdisability = consolidatedFirePerimeterData.sum_estpopwithdisability ? `${parseFloat(consolidatedFirePerimeterData.sum_estpopwithdisability/consolidatedFirePerimeterData.sum_p0010001*100).toFixed(0)}%` : 'No data'
          }

          const perimeterLandCover  = {
            PctBarren: consolidatedFirePerimeterData.PctBarren,
            PctCropland: consolidatedFirePerimeterData.PctCropland,
            PctDevelop: consolidatedFirePerimeterData.PctDevelop,
            PctForest: consolidatedFirePerimeterData.PctForest,
            PctGrass: consolidatedFirePerimeterData.PctGrass,
            PctShrub: consolidatedFirePerimeterData.PctShrub,
            PctSnowIce: consolidatedFirePerimeterData.PctSnowIce,
            PctWater: consolidatedFirePerimeterData.PctWater,
            PctWetlands: consolidatedFirePerimeterData.PctWetlands,
          }

          const perimeterEcology = {
            L3EcoReg: consolidatedFirePerimeterData.L3EcoReg ? consolidatedFirePerimeterData.L3EcoReg : 'No information',
            LandForm: consolidatedFirePerimeterData.LandForm ? consolidatedFirePerimeterData.LandForm : 'No information',
            RichClass: consolidatedFirePerimeterData.RichClass ? consolidatedFirePerimeterData.RichClass : 'No data',
            CritHab:  consolidatedFirePerimeterData.CritHab ? consolidatedFirePerimeterData.CritHab : 'None present',
            OwnersPadus: consolidatedFirePerimeterData.OwnersPadus ? consolidatedFirePerimeterData.OwnersPadus : 'None present'
          }

           try {
            consolidatedFirePerimeterData.WHPClass = consolidatedFirePerimeterData.WHPClass.replace(/'/g, '"');
            
            const consolidatedWHPClass = JSON.parse(consolidatedFirePerimeterData.WHPClass)
            
            consolidatedWHPClass["Very High"] = consolidatedWHPClass['Very High']/consolidatedFirePerimeterData.Hex_Count || 0
            consolidatedWHPClass["High"] = consolidatedWHPClass["High"]/consolidatedFirePerimeterData.Hex_Count || 0
            consolidatedWHPClass["Moderate"] = consolidatedWHPClass["Moderate"]/consolidatedFirePerimeterData.Hex_Count || 0
            consolidatedWHPClass["Low"] = consolidatedWHPClass["Low"]/consolidatedFirePerimeterData.Hex_Count || 0
            consolidatedWHPClass["Very Low"] = consolidatedWHPClass["Very Low"]/consolidatedFirePerimeterData.Hex_Count || 0

            formatWildfireRiskData({ consolidatedWHPClass })

          } catch(error) {
            console.log('Error happened here!')
            console.error(error)
          }
        
          populationBarGraph(populationData)
          englishBarGraph( perimeterPopulationSpeakingEnglish );
          vehiclePercentageBar( perimeterPopulationWithVehicle );
          totalPopulationUIRender({ perimeterPopulation });
          housingInfoRender({ perimeterHousingData });
          landCoverDataFormatting({ perimeterLandCover });
          habitatInfoRender({ perimeterEcology })
        }else{
        //If there is no return with that IrwinID, then it must be a fire-point. Not a perimeter.
        populationAndEcologyPointHexQuery({ irwinIdNumber, mapPoint })
        
        }


      })
  }

    const populationAndEcologyPointHexQuery = ({ irwinIdNumber, mapPoint }) => {
    
    
    const url ='https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/Wildfire_aggregated_v1/FeatureServer/0/query';
      console.log('getting point data')
    console.log(irwinIdNumber)

    const params = {
      where: `irwinID = '${irwinIdNumber}'`,
      geometryType: 'esriGeometryPoint',      
      spatialRelationship: 'intersects',
      distance: 2,
      units: 'esriSRUnit_StatuteMile',
      inSR: 3857,
      outFields: '*',
      returnGeometry: true,
      returnQueryGeometry: true,
      f: 'json'
    }

    axios.get(url, {
      params
    })
      .then((response) => {
        console.log(response)
        console.log(mapPoint)
        addCircleGraphic({ mapPoint });
        newEcoQuery({ mapPoint });
        censusBlockCentroidQuery({ mapPoint });
      })
  }

  const currentDroughtQuery = ({mapPoint, fireInformation}) => {
    
    const url = 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/US_Drought_Intensity_v1/FeatureServer/3/query'

    const params = {
     where: '1=1',
      geometry: fireInformation ? `${fireInformation[0]}` : mapPoint,
      geometryType: 'esriGeometryPoint',      
      inSR: fireInformation ? 4326 : 4326,
      spatialRelationship: 'intersects',
      outFields: 'dm',
      returnQueryGeometry: true,
      f: 'json'
    }

    axios.get(url, {
      params
    })
      .then((response) => {
        console.log(response)
        const droughtCondition = response.data.features[0] 
        ? response.data.features[0].attributes.dm 
        : 'Drought conditions not reported';
        
        console.log('Drought conditions')
        console.log(droughtCondition)
        

        const droughtStatus = (droughtCondition) => {
          if(droughtCondition === 0) {
            return 'Abnormally dry'
          } else if (droughtCondition === 1){
              return 'Moderate'
          } else if (droughtCondition === 2) {
              return 'Severe'
          } else if (droughtCondition === 3) {
              return 'Extreme'
          } else if (droughtCondition === 4) {
              return ' Exceptional'
          } else if (droughtCondition === 'Drought conditions not reported') {
            return 'None present'
          }
        }
        console.log(droughtStatus(droughtCondition))
        renderDroughtStatus( droughtStatus(droughtCondition))

      })

    }

    const weatherCollection = async ({ mapPoint, fireInformation }) => {
      const temp = await temperatureQuery({ mapPoint, fireInformation });
      const wind = await windForecastQuery({ mapPoint, fireInformation });
      const airQualityToday = await currentAirQuality({ mapPoint, fireInformation });
      const airQualityTomorrow = await forecastAirQuality({ mapPoint, fireInformation });
      //TODO: CREATE THIS FUNCTION
      console.log(temp, wind, airQualityToday, airQualityTomorrow )
      renderWeatherInformation({ temp, wind, airQualityToday, airQualityTomorrow })
    }

    const temperatureQuery = async ({mapPoint, fireInformation}) => {
    
      return new Promise (resolve => {  
      const url = 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/NDFD_DailyTemperature_v1/FeatureServer/1/query'
      
      const params = {
        where: '1=1',
        geometry: fireInformation ? `${fireInformation[0]}` : mapPoint,
        geometryType: 'esriGeometryPoint',      
        inSR: 4326,
        spatialRelationship: 'intersects',
        outFields: ['period', 'temp'].join(','),
        returnQueryGeometry: true,
        f: 'json'
      }

      axios.get(url, {
        params
      })
        .then((response) => {
          console.log('temperature')
          console.log(response.data.features.sort((a, b) => {
            return a.attributes.Period - b.attributes.Period 
          }))
          const dailyTemperatures = response.data.features.sort((a, b) => { 
          a.attributes.Period - b.attributes.Period});

          const temp = {
            todayF: dailyTemperatures[0].attributes.Temp,
            tomorrowF: dailyTemperatures[1].attributes.Temp,
            todayC: Math.round((dailyTemperatures[0].attributes.Temp - 32) * 5/9),
            tomorrowC: Math.round((dailyTemperatures[1].attributes.Temp - 32) * 5/9)
          };

          resolve(temp)
        })
        .catch((error) => {
          console.error(error)
        })
    })
  }

  const windForecastQuery = async ({mapPoint, fireInformation}) => {
    return new Promise (resolve => {
    const url = 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/NDFD_WindSpeed_v1/FeatureServer/0/query'

    const params = {
      where: '1=1',
      geometry: fireInformation ? `${fireInformation[0]}` : mapPoint,
      geometryType: 'esriGeometryPoint',      
      inSR: 4326,
      outFields: ['fromdate', 'todate', 'force', 'label'].join(','),
      returnQueryGeometry: true,
      f: 'json'
    }

    axios.get(url, {
      params
    })
      .then((response) => {
        console.log('Wind Forecast')
        console.log(response)
        const windTime = response.data.features.length  
                        ? response.data.features.sort((a, b) => a.attributes.fromdate - b.attributes.fromdate)
                        : null

        console.log(windTime)
        const windForce = [
          {
            mph: '< 1mph',
            kph: '< 1km/h'
          },
          {
            mph: '1-3 mph',
            kph: '1-5 km/h'
          },
          {
            mph: '4-7 mph',
            kph: '6-11 km/h'
          },
          {
            mph: '8-12 mph',
            kph: '12-19 km/h'
          },
          {
            mph: '13-17 mph',
            kph: '20-28 km/h'
          },
          {
            mph: '18-24 mph',
            kph: '29-38 km/h'
          },
          {
            mph: '25-30 mph',
            kph: '39-49 km/h'
          },
          {
            mph: '31-38 mph',
            kph: '50-61 km/h'
          },
          {
            mph: '39-46 mph',
            kph: '62-74 km/h'
          },
          {
            mph: '47-54 mph',
            kph: '75-88 km/h'
          },
          {
            mph: '55-63 mph',
            kph: '89-102 km/h'
          },
          {
            mph: '64-72 mph',
            kph: '103-117 km/h'
          },
          {
            mph: '72-82 mph',
            kph: '118-132 km/h'
          },
          {
            mph: '83-92 mph',
            kph: '133-148 km/h'
          },
          {
            mph: '93-103 mph',
            kph: '149-165 km/h'
          },
          {
            mph: '104-114 mph',
            kph: '166-183 km/h'
          },
          {
            mph: '115-125 mph',
            kph: '184-200 km/h'
          },
          {
            mph: 'No data',
            kph: 'No data'
          }
        ]
        
        const wind = windTime ?{
          today: windForce[windTime[0].attributes.force],
          tomorrow: windForce[windTime[8].attributes.force]
        } : {
          today: windForce[17],
          tomorrow: windForce[17],
        }
        
        
        resolve(wind);
        // windRender({ wind })
      })
      .catch((error) => {
        console.error(error)
      })
    })
  }

  const currentAirQuality = ({ mapPoint, fireInformation }) => {
    return new Promise (resolve => {
      const url = 'https://services.arcgis.com/cJ9YHowT8TU7DUyn/ArcGIS/rest/services/AirNowAQIForecast/FeatureServer/0/query'

      const params = {
        where: '1=1',
        geometry: fireInformation ? `${fireInformation[0]}` : mapPoint,
        geometryType: 'esriGeometryPoint',      
        inSR: 4326,
        outFields: 'gridcode',
        returnQueryGeometry: true,
        f: 'json'
      }

      axios.get(url, {
        params
      })
        .then((response) => {
          console.log('Current Air Quality:')
          
          const currentAQICode = response.data.features[0]
                            ? response.data.features[0].attributes.gridcode
                            : 'No data'
                                
          console.log(currentAQICode)
          const airQualityToday = (currentAQICode) => { 
            if(currentAQICode === 1) {
                return 'Good';
            } else if (currentAQICode === 2) {
                return 'Moderate';
            } else if (currentAQICode ===3) {
                return 'Unhealthy for sensitive groups';
            } else if (currentAQICode === 4) {
                return 'Unhealthy';
            } else if (currentAQICode === 5) {
                return 'Very unhealthy';
            } else if (currentAQICode === 6) {
              return 'Hazardous';
            } else {
              return 'No data';
            }
          };

          resolve(airQualityToday(currentAQICode));

        })
        .catch((error) => {
          console.error(error);
        })
      })
  }

  const forecastAirQuality = ({ mapPoint, fireInformation }) => {
    return new Promise (resolve => {
      const url = 'https://services.arcgis.com/cJ9YHowT8TU7DUyn/ArcGIS/rest/services/AirNowAQIForecast/FeatureServer/1/query'

      const params = {
        where: '1=1',
        geometry: fireInformation ? `${fireInformation[0]}` : mapPoint,
        geometryType: 'esriGeometryPoint',      
        inSR: 4326,
        outFields: 'gridcode',
        returnQueryGeometry: true,
        f: 'json'
      }

      axios.get(url, {
        params
      })
        .then((response) => {
          console.log('Air Quality Forecast:')
          console.log(response)
          const airQualityForecast = response.data.features[0]
                                   ? response.data.features[0].attributes.gridcode
                                   : 'No data'

          const airQualityTomorrow = (airQualityForecast) => { 
            if(airQualityForecast === 1) {
                return 'Good';
            } else if (airQualityForecast === 2) {
                return 'Moderate';
            } else if (airQualityForecast ===3) {
                return 'Unhealthy for sensitive groups';
            } else if (airQualityForecast === 4) {
                return 'Unhealthy';
            } else if (airQualityForecast === 5) {
                return 'Very unhealthy';
            } else if (airQualityForecast === 6) {
              return 'Hazardous';
            } else {
              return 'No data';
            }
          };
          //TODO: create this function to render the AQ forecast
          resolve(airQualityTomorrow(airQualityForecast));
        })
        .catch((error) => {
          console.error(error);
        })
      })
  }

  const censusBlockCentroidQuery = ({ mapPoint, fireInformation }) => {

    const url = 'https://services.arcgis.com/jIL9msH9OI208GCb/ArcGIS/rest/services/Populated_Block_Centroids_2020_v3/FeatureServer/1/query'

    const params = {
      where: "1=1",
      geometry: fireInformation ? `${fireInformation[0]}` : mapPoint,
      geometryType: 'esriGeometryPoint',      
      spatialRelationship: 'intersects',
      distance: 2,
      units: 'esriSRUnit_StatuteMile',
      inSR: 4326,
      outFields: ['P0010001', 'Estimated0_14Pop', 'Estimated15_17Pop', 'Estimated18to64Pop', 'Estimated65_79Pop', 'Estimated80PlusPop', 'EstPopWithDisability', 'EstPopinPoverty', 'EstPopNoEnglish', 'EstPopWith0Vehicles', 'H0010001', 'WeightedMedianHomeValue'].join(','),
      returnGeometry: true,
      returnQueryGeometry: true,
      f: 'json'
    }

    axios.get(url, {
      params
    })
      .then((response) => {
        console.log(response)

    if(response.data.features){
      const aggregatedPopulationBlockObject = response.data.features.reduce((a,b) => {
          Object.keys(b.attributes).forEach(key => {
            a[key] = (a[key] || 0) + b.attributes[key];
        }), 0;
        return a
        },{})
                  
        console.log(aggregatedPopulationBlockObject)
        

    //WHEN THERE IS NO NUMBER we get NaN. Not 0. Make sure we're working with these conditions in the renders -- use 'No Data' instead of 0.  
      const populationData = [{'data': aggregatedPopulationBlockObject.Estimated0_14Pop, name: '< 14'}, {'data': aggregatedPopulationBlockObject.Estimated15_17Pop, name: '15-17'}, {'data': aggregatedPopulationBlockObject.Estimated18to64Pop, name: '18-64'},{'data': aggregatedPopulationBlockObject.Estimated65_79Pop, 'name': '65-79'},{'data': aggregatedPopulationBlockObject.Estimated80PlusPop, 'name': '+ 80'}];
      const englishSpeakingPopulation = {value: parseFloat(100 - (aggregatedPopulationBlockObject.EstPopNoEnglish/aggregatedPopulationBlockObject.P0010001)*100).toFixed(1)}
      const populationWithVehicle = {value: parseFloat(100 - (aggregatedPopulationBlockObject.EstPopWith0Vehicles/aggregatedPopulationBlockObject.P0010001)*100).toFixed(1)}
      const weightedMedianHomeValue = Math.round(aggregatedPopulationBlockObject.WeightedMedianHomeValue/aggregatedPopulationBlockObject.H0010001);

      const radiusHousingData = {
        TotalHousingUnits: aggregatedPopulationBlockObject.H0010001 ? aggregatedPopulationBlockObject.H0010001.toLocaleString() : 'No housing data',
        MedianValue: aggregatedPopulationBlockObject.WeightedMedianHomeValue ? `$${weightedMedianHomeValue.toLocaleString()}` : 'No housing data'
      }
      const totalRadiusPopulation = {
        totalPopulation: aggregatedPopulationBlockObject.P0010001 ? aggregatedPopulationBlockObject.P0010001.toLocaleString() : 'No data',
        percentofPopulationInPoverty: aggregatedPopulationBlockObject.EstPopinPoverty ? `${parseFloat(aggregatedPopulationBlockObject.EstPopinPoverty/aggregatedPopulationBlockObject.P0010001*100).toFixed(0)}%` : 'No data',
        percentofPopulationWithDisability: aggregatedPopulationBlockObject.EstPopWithDisability ? `${parseFloat(aggregatedPopulationBlockObject.EstPopWithDisability/aggregatedPopulationBlockObject.P0010001*100).toFixed(0)}%` : 'No data'
      }
      const radiusEcologyData = {

      }
      
      populationBarGraph( populationData )
      englishBarGraph( englishSpeakingPopulation )
      vehiclePercentageBar( populationWithVehicle )
      totalPopulationUIRender({ totalRadiusPopulation })
      housingInfoRender({ radiusHousingData })

    }else{
      const aggregatedPopulationBlockObject = {
        P0010001: 0,
        H0010001: 0,
        Estimated0_14Pop: 0,
        Estimated15_17Pop: 0,
        Estimated18to64Pop: 0,
        Estimated65_79Pop: 0, 
        Estimated80PlusPop: 0,
        EstPopWithDisability: 0,
        EstPopinPoverty: 0,
        EstPopNoEnglish: 0,
        EstPopWith0Vehicles: 0,
        WeightedMedianHomeValue:0
      }
    }
   });
  };

  // const populationAgeByYear = ({ mapPoint, fireInformation }) => {

  //   const url = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_Total_Population_Boundaries/FeatureServer/2/query'

  //   const params = {
  //     where: '1=1',
  //     geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
  //     geometryType: 'esriGeometryPoint',      
  //     inSR: 4326,
  //     outFields: ['B01001_001E', 'B01001_003E', 'B01001_004E', 'B01001_027E', 'B01001_028E', 'B01001_005E', 'B01001_006E', 'B01001_029E', 'B01001_030E', 'B01001_049E', 'B01001_048E', 'B01001_025E', 'B01001_024E', 'B01001_calc_pctLT18E', 'B01001_calc_numLT18E', 'B01001_calc_numGE65E', 'B01001_calc_numGE65E'].join(','),
  //     returnGeometry: true,
  //     returnQueryGeometry: true,
  //     f: 'json'
  //   }

  //   axios.get(url, {
  //     params
  //   })
  //   .then((response) => {

  //     const underFourteenPop = response.data.features[0] 
  //     ? response.data.features[0].attributes.B01001_003E + response.data.features[0].attributes.B01001_004E + response.data.features[0].attributes.B01001_005E + response.data.features[0].attributes.B01001_027E + response.data.features[0].attributes.B01001_028E + response.data.features[0].attributes.B01001_029E
  //     : 'No information available';

  //     const fifteenToSeventeenPop = response.data.features[0]
  //     ? response.data.features[0].attributes.B01001_006E + response.data.features[0].attributes.B01001_030E
  //     : 'No information available';

  //     const eightteenToSixtyfourPop = response.data.features[0] 
  //     ? response.data.features[0].attributes.B01001_001E -  response.data.features[0].attributes.B01001_calc_numLT18E - response.data.features[0].attributes.B01001_calc_numGE65E
  //     : 'No information available';

  //     const eightyPop = response.data.features[0]
  //     ? response.data.features[0].attributes.B01001_024E + response.data.features[0].attributes.B01001_025E + response.data.features[0].attributes.B01001_048E + response.data.features[0].attributes.B01001_049E
  //     : 'No information available';

  //     const sixtyfiveToSeventynine = response.data.features[0]
  //     ? response.data.features[0].attributes.B01001_calc_numGE65E - eightyPop
  //     : 'No information available';

  //     const censusTract = response.data.features[0]
  //     ? response.data.features[0].geometry
  //     : 'geometry unavailable'; 

  //     const totalPopulation = response.data.features[0] 
  //     ? response.data.features[0].attributes.B01001_001E
  //     : 'No information available';

  //     const populationData = response.data.features[0] 
  //     ? [{'data': underFourteenPop, name: '< 14'}, {'data': fifteenToSeventeenPop, name: '15-17'}, {'data': eightteenToSixtyfourPop, name: '18-64'},{'data': sixtyfiveToSeventynine, 'name': '65-79'},{'data': eightyPop, 'name': '+ 80'}]
  //     : null;

      
      
  //    //totalPopulationUIRender({ totalPopulation })
  //   })
  //   .catch((error) => {
  //     console.error(error)
  //   })
  // };

  // const disabledPopulationQuery = ({ mapPoint, fireInformation }) => {

  // const url = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_Disability_by_Type_Boundaries/FeatureServer/2/query';

  // const params = {
  //    where: '1=1',
  //      geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
  //     geometryType: 'esriGeometryPoint',      
  //     inSR: 4326,
  //     outFields: 'C18108_calc_pctDE',
  //     returnQueryGeometry: true,
  //     f: 'json'
  //   }

  //   axios.get(url, {
  //     params
  //   })
  //     .then((response) => {
  //       const disabledPopulation = response.data.features[0]
  //       ? `${response.data.features[0].attributes.C18108_calc_pctDE}`
  //       : null; 
  //       console.log('disabled population:')
  //       console.log(disabledPopulation);
  //       //disabledPopulationRender(disabledPopulation);
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     })
  // }

  // const povertyPopulationQuery = ({ mapPoint, fireInformation }) => {

  //   const url = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_Poverty_by_Age_Boundaries/FeatureServer/2/query';

  //   const params = {
  //     where: '1=1',
  //      geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
  //     geometryType: 'esriGeometryPoint',      
  //     inSR: 4326,
  //     outFields: 'B17020_calc_pctPovE',
  //     f:'json'
  //   }

  //   axios.get(url, {
  //     params
  //   })
  //     .then((response) => {
  //       const povertyPopulation = response.data.features[0]
  //       ? `${response.data.features[0].attributes.B17020_calc_pctPovE}`
  //       : null;
  //       console.log('poverty population')
  //       console.log(povertyPopulation)

  //       // povertyPopulationRender(povertyPopulation)
  //     })

  // }

  

  // const englishSpeakingAdults = ({ mapPoint, fireInformation }) => {

  //   const url = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_English_Ability_and_Lingusitic_Isolation_Households_Boundaries/FeatureServer/2/query'

  //   const params = {
  //     where: '1=1',
  //      geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
  //     geometryType: 'esriGeometryPoint',      
  //     inSR: 4326,
  //     outFields: '100 - B16004_calc_pctGE18LEAE',
  //     f: 'json'
  //   }

  //   axios.get(url, {
  //     params
  //   })
  //     .then((response) => {
  //       const englishSpeakingPopulation = {value: response.data.features[0].attributes.FIELD_EXP_0}
        
        
  //     })
  // }

  // const householdsWithVehicle = ({ mapPoint, fireInformation }) => {

  //   const url = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_Vehicle_Availability_Boundaries/FeatureServer/2/query';

  //   const params = {
  //     where: '1=1',
  //      geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
  //     geometryType: 'esriGeometryPoint',      
  //     inSR: 4326,
  //     outFields: '100 - B08201_calc_pctNoVehE',
  //     f: 'json'
  //   }

  //   axios.get(url, {
  //     params
  //   })
  //     .then((response) => {
  //       const concentrationOfVehicles = response.data.features[0].attributes.FIELD_EXP_0
  //       console.log(`Households with a vehicle: ${response.data.features[0].attributes.FIELD_EXP_0}%`)
        
  //     })
  // }

  // const landCoverQuery = ({ mapPoint, fireInformation }) => {
  //   console.log('landCover Called')
    
  //   const url = 'https://services.arcgis.com/jIL9msH9OI208GCb/ArcGIS/rest/services/Nlcd_Simplified_By_Census_Tract_220412a/FeatureServer/0/query'

  //   const params = {
  //     where: '1=1',
  //     geometry: fireInformation ? `${fireInformation[0]}` : mapPoint,
  //     geometryType: 'esriGeometryPoint',
  //     inSR: 4326,
  //     outFields: ['PctWater', 'PctSnowIce', 'PctDeveloped', 'PctBarren', 'PctForest', 'PctShrubScrub', 'PctGrassHerb', 'PctCropPasture', 'PctWetlands'].join(','),
  //     f:'json',
  //   }

  //   axios.get(url, {
  //     params
  //   })
  //     .then((response) => {
  //       console.log(response)
  //       const landCoverPercentage = response.data.features[0].attributes
  //       console.log('Land Cover')
  //       console.log(landCoverPercentage)
  //       //landCoverDataFormatting({ landCoverPercentage })
  //     })
  // }

  // const ecoregionQuery = ({ mapPoint, fireInformation }) => {

  //   const url = 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/ArcGIS/rest/services/EPA_Level_III_Ecoregions/FeatureServer/0/query'

  //   const params = {
  //     where: '1=1',
  //      geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
  //     geometryType: 'esriGeometryPoint',      
  //     inSR: 4326,
  //     outFields: 'NA_L3NAME',
  //     f: 'json'
  //   }

  //   axios.get(url, {
  //     params
  //   })
  //     .then((response) => {
  //       console.log(`Ecoregion: ${response.data.features[0].attributes.NA_L3NAME}`)
  //     })
  // }

  // const criticalHabitatQuery = ({ mapPoint, fireInformation }) => {

  //   const url = 'https://services.arcgis.com/jIL9msH9OI208GCb/ArcGIS/rest/services/Environmental_Information_by_Tract/FeatureServer/0/query?'

  //   const params = {
  //     where: '1=1',
  //     geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
  //     geometryType: 'esriGeometryPoint',      
  //     inSR: 4326,
  //     outFields: '*',
  //     f: 'json'
  //   }

  //   axios.get(url, {
  //     params
  //   })
  //     .then((response) => {
        
  //       const uneditedProtectedLandsList = response.data.features[0].attributes.OwnersPadus
  //                                       ? response.data.features[0].attributes.OwnersPadus.split(', ')
  //                                       : 'None present';

  //         uneditedProtectedLandsList[0] === uneditedProtectedLandsList[1]
  //         ? uneditedProtectedLandsList.shift()
  //         : null;

       
  //       const editedCritList = response.data.features[0].attributes.CritHab.replace(/ *\([^)]*\) */g, " ")

  //       const habitatDetails = {
  //         bioDiversity: response.data.features[0].attributes.RichClass,
  //         ecoregion: response.data.features[0].attributes.L3EcoReg
  //                  ? response.data.features[0].attributes.L3EcoReg
  //                  : 'No information available',
  //         landformType: response.data.features[0].attributes.LandForm
  //                     ? response.data.features[0].attributes.LandForm
  //                     : 'No information available',
  //         criticalHabitat: response.data.features[0].attributes.CritHab
  //                        ? editedCritList
  //                        : 'None present',
  //         protectedAreas: typeof(uneditedProtectedLandsList ) === "object"
  //                         ? uneditedProtectedLandsList.join(', ')
  //                         : 'None present',
  //         tractRanking: response.data.features[0].attributes.RichRank,
  //         totalTracts: response.data.features[0].attributes.TotalTracts,
  //         state: response.data.features[0].attributes.State.toUpperCase()
  //       }
  //       console.log(habitatDetails)
  //       habitatInfoRender({ habitatDetails })
  //     })
  //     .catch((error) => {
  //       console.error(error)
  //     })
  // }

  // const fireRiskQuery = ({ mapPoint, fireInformation }) => {
  //   fireInformation ? console.log(fireInformation) : console.log(mapPoint)

  //   const url = 'https://services.arcgis.com/XG15cJAlne2vxtgt/ArcGIS/rest/services/National_Risk_Index_Census_Tracts/FeatureServer/0/query'

  //   const params = {
  //     where: '1=1',
  //     geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
  //     geometryType: 'esriGeometryPoint',      
  //     inSR: 4326,
  //     outFields: ['STATE','WFIR_RISKR'].join(','),
  //     f: 'json'
  //   }

  //   axios.get(url, {
  //     params
  //   })
  //     .then((response) => {
  //       console.log(response.data.features[0])
  //       const fireRiskRating = response.data.features[0].attributes.WFIR_RISKR
  //       console.log(fireRiskRating)
  //       renderRisk(fireRiskRating)
  //     })
  // }

//NEW ECO QUERY
  const newEcoQuery = ({ mapPoint, fireInformation }) => {

    const url = 'https://services.arcgis.com/jIL9msH9OI208GCb/ArcGIS/rest/services/AllHexesFromAgolAsPoints220811a/FeatureServer/22/query'

    const params = {
      where: '1=1',
      geometry: fireInformation ? `${fireInformation[0]}` : mapPoint,
      geometryType: 'esriGeometryPoint',
      inSR: 4326,
      spatialRelationship: 'intersects',
      distance: 2,
      units: 'esriSRUnit_StatuteMile',
      outFields: ['L3EcoReg', 'LandForm', 'CritHab', 'OwnersPadus', 'RichClass', 'WHPClass', 'PctWater', 'PctSnowIce', 'PctDevelop', 'PctBarren', 'PctForest', 'PctShrub', 'PctGrass', 'PctCropland', 'PctWetlands', 'SumCarbon', 'ForestTypeGroup  '].join(','),
      returnGeometry: true,
      returnQueryGeometry: true,
      outSR: 3857,
      f: 'json'
    }

    axios.get(url, {
      params
    })
      .then((response) => {
        console.log(response);
        
        const ecoResponse = response.data.features;
        
        if(response.data.features){
        const aggragateEcoObj = ecoResponse.reduce((a,b) => {
          Object.keys(b.attributes).forEach(key => {
            
            if(typeof(b.attributes[key]) === 'string' || typeof(b.attributes[key]) === 'object'){  
              (a[key] = (a[key] + ', '|| "" + b.attributes[key])) 
            }

            (a[key] = (a[key] || 0) + b.attributes[key])
          })
          return a
        }, {})

      //Creating a list from from the CritHabitat obj. Taking only the keys listed.
        aggragateEcoObj.CritHab
        ?  aggragateEcoObj.CritHab = aggragateEcoObj.CritHab.split(', ').filter(entry => !entry.includes(undefined) && !entry === false).reduce((CritHabObj, CritHabItem) => {
            !CritHabObj[CritHabItem] 
            ? CritHabObj[CritHabItem] = 1 
            : CritHabObj[CritHabItem]++
            return CritHabObj
            },{})
        : null;
        //if there are no keys return a string, otherwise join the array together.
        !aggragateEcoObj.CritHab[Object.keys(aggragateEcoObj.CritHab)[0]]
        ? aggragateEcoObj.CritHab = 'None present'
        : aggragateEcoObj.CritHab = Object.keys(aggragateEcoObj.CritHab).join(', ');
        
        //Creating an object of EcoRegion entries and their 'count' value from an array 
        aggragateEcoObj.L3EcoReg
        ? aggragateEcoObj.L3EcoReg = aggragateEcoObj.L3EcoReg.split(', ').filter(entry => !entry.includes(undefined)).reduce((L3EcoRegObj, L3EcoRegItem) => {
            !L3EcoRegObj[L3EcoRegItem] 
            ? L3EcoRegObj[L3EcoRegItem] = 1 
            : L3EcoRegObj[L3EcoRegItem]++
            return L3EcoRegObj
          },{})
        : null;
        // console.log(aggragateEcoObj.L3EcoReg)
        !aggragateEcoObj.L3EcoReg[Object.keys(aggragateEcoObj.L3EcoReg)[0]]
        ? aggragateEcoObj.L3EcoReg = 'No information available'
        : aggragateEcoObj.L3EcoReg = Object.entries(aggragateEcoObj.L3EcoReg).sort((a, b) => b[0].localeCompare(a[0])).sort((a, b) => b[1] - a[1])

        aggragateEcoObj.LandForm
        ? aggragateEcoObj.LandForm = aggragateEcoObj.LandForm.split(', ').filter(entry => !entry.includes(undefined)).reduce((landformObj, landformItem) => {
            !landformObj[landformItem] 
            ? landformObj[landformItem] = 1 
            : landformObj[landformItem]++
            return landformObj
            },{})
        : null;
        
        !aggragateEcoObj.LandForm[Object.keys(aggragateEcoObj.LandForm)[0]]
        ? aggragateEcoObj.LandForm = 'No information available'
        : aggragateEcoObj.LandForm = Object.entries(aggragateEcoObj.LandForm).sort((a, b) => b[0].localeCompare(a[0])).sort((a, b) => b[1] - a[1])

        // const sortedAggragateEcoLandform = Object.entries(aggragateEcoObj.LandForm).sort((a, b) => b[0].localeCompare(a[0]))
        // aggragateEcoObj.LandForm = sortedAggragateEcoLandform.sort((a, b) => b[1] - a[1])        

          //Creating an object of ForestType entries and their 'count' value from an array 
        aggragateEcoObj.ForestTypeGroup
        ? aggragateEcoObj.ForestTypeGroup = aggragateEcoObj.ForestTypeGroup.split(',').filter(entry => !entry.includes(undefined) && !entry.includes(null)).reduce((ForestTypeGroupObj, ForestTypeGroupItem) => {
            !ForestTypeGroupObj[ForestTypeGroupItem] 
            ? ForestTypeGroupObj[ForestTypeGroupItem] = 1 
            : ForestTypeGroupObj[ForestTypeGroupItem]++
            return ForestTypeGroupObj
          },{})
        : null;
        !aggragateEcoObj.ForestTypeGroup[Object.keys(aggragateEcoObj.ForestTypeGroup)[0]]
        ? aggragateEcoObj.ForestTypeGroup = 'No information available'
        : aggragateEcoObj.ForestTypeGroup = Object.entries(aggragateEcoObj.ForestTypeGroup).sort((a, b) => b[0].localeCompare(a[0])).sort((a, b) => b[1] - a[1])


        console.log(aggragateEcoObj.OwnersPadus)
        aggragateEcoObj.OwnersPadus
        ? aggragateEcoObj.OwnersPadus = aggragateEcoObj.OwnersPadus.split(', ').filter(entry => !entry.includes(undefined) && !entry === false).reduce((OwnersPadusObj, OwnersPadusItem) => {
            !OwnersPadusObj[OwnersPadusItem] 
            ? OwnersPadusObj[OwnersPadusItem] = 1 
            : OwnersPadusObj[OwnersPadusItem]++
            return OwnersPadusObj
          },{})
        : null;
        !aggragateEcoObj.OwnersPadus[Object.keys(aggragateEcoObj.OwnersPadus)[0]]
        ? aggragateEcoObj.OwnersPadus = 'None present'
        : aggragateEcoObj.OwnersPadus = Object.keys(aggragateEcoObj.OwnersPadus).join(', ');
        
      //creating the Biodeversity richness class from the return object
        aggragateEcoObj.RichClass
        ? aggragateEcoObj.RichClass = aggragateEcoObj.RichClass.split(', ').filter(entry => !entry.includes(undefined) && !entry.includes(null)).reduce((RichClassObj, RichClassItem) => {
            !RichClassObj[RichClassItem] 
            ? RichClassObj[RichClassItem] = 1 
            : RichClassObj[RichClassItem]++
            return RichClassObj
          },{})
        : null;
        !aggragateEcoObj.RichClass[Object.keys(aggragateEcoObj.RichClass)[0]]
        ? aggragateEcoObj.RichClass = 'No data available'
        : aggragateEcoObj.RichClass = Object.entries(aggragateEcoObj.RichClass).sort((a, b) => b[0].localeCompare(a[0])).sort((a, b) => b[1] - a[1])
        
        aggragateEcoObj.SumCarbon = aggragateEcoObj.SumCarbon !== null
        ? Math.round(aggragateEcoObj.SumCarbon)
        : 0;
        
      //creating the WFHP object from the returned object
        console.log(aggragateEcoObj.WHPClass)
        aggragateEcoObj.WHPClass
        ? aggragateEcoObj.WHPClass = aggragateEcoObj.WHPClass.split(', ').filter(entry => !entry.includes(undefined)).reduce((WHPClassObj, WHPClassItem) => {
            !WHPClassObj[WHPClassItem] 
            ? WHPClassObj[WHPClassItem] = 1 
            : WHPClassObj[WHPClassItem]++
            return WHPClassObj
          },{})
        : null;
        
        
      //Adjusting the percentages
        aggragateEcoObj.PctBarren = aggragateEcoObj.PctBarren/ecoResponse.length
        aggragateEcoObj.PctCropland = aggragateEcoObj.PctCropland/ecoResponse.length
        aggragateEcoObj.PctDevelop = aggragateEcoObj.PctDevelop/ecoResponse.length
        aggragateEcoObj.PctForest = aggragateEcoObj.PctForest/ecoResponse.length
        aggragateEcoObj.PctGrass = aggragateEcoObj.PctGrass/ecoResponse.length
        aggragateEcoObj.PctShrub = aggragateEcoObj.PctShrub/ecoResponse.length
        aggragateEcoObj.PctSnowIce = aggragateEcoObj.PctSnowIce/ecoResponse.length
        aggragateEcoObj.PctWater = aggragateEcoObj.PctWater/ecoResponse.length
        aggragateEcoObj.PctWetlands = aggragateEcoObj.PctWetlands/ecoResponse.length
      
        //Sorting the WF risk potential.
        if(aggragateEcoObj.WHPClass){
        aggragateEcoObj.WHPClass["Very High"] = aggragateEcoObj.WHPClass["Very High"]/ecoResponse.length || 0;
        aggragateEcoObj.WHPClass["High"] = aggragateEcoObj.WHPClass["High"] / ecoResponse.length || 0;
        aggragateEcoObj.WHPClass["Moderate"] = aggragateEcoObj.WHPClass["Moderate"] / ecoResponse.length || 0;
        aggragateEcoObj.WHPClass["Low"] = aggragateEcoObj.WHPClass["Low"] / ecoResponse.length || 0;
        aggragateEcoObj.WHPClass["Very Low"] = aggragateEcoObj.WHPClass["Very Low"] / ecoResponse.length || 0;
        }
        console.log(ecoResponse)
        console.log(aggragateEcoObj)
        
        
        formatWildfireRiskData({ aggragateEcoObj })
        landCoverDataFormatting ({ aggragateEcoObj })
        habitatInfoRender({ aggragateEcoObj })
        //renderMapHexes(response.data.queryGeometry)
      }else {
        console.log('no eco data')
        
        const aggragateEcoObj = {
          CritHab: 'None present',
          L3EcoReg: 'No information available',
          LandForm: 'No information available',
          OwnersPadus: 'None present',
          RichClass: 'No information available',
          PctBarren: 0,
          PctCropland: 0,
          PctDevelop: 0,
          PctForest: 0,
          PctGrass: 0,
          PctShrub: 0,
          PctSnowIce: 0,
          PctWater: 0,
          PctWetlands: 0,
          WHPClass: {
            'Very High': 0,
            'High': 0,
            'Moderate': 0,
            'Low': 0,
            'Very Low': 0
          }
        }
        habitatInfoRender({ aggragateEcoObj })
        landCoverDataFormatting ({ aggragateEcoObj })
        formatWildfireRiskData({ aggragateEcoObj })
      }

      })
  };

//DATA VIZ

//Landcover piechart
const landCoverDataFormatting = ({ aggragateEcoObj, perimeterLandCover }) => {
                     
  const landCoverArray = [
    {'name': 'Forest', 'percent': aggragateEcoObj ? aggragateEcoObj["PctForest"] : perimeterLandCover["PctForest"], 'fill':'#005948'}, 
    {'name': 'Barren', 'percent': aggragateEcoObj ? aggragateEcoObj["PctBarren"] : perimeterLandCover["PctBarren"], 'fill': '#6E726B'},
    {'name': 'Cropland', 'percent': aggragateEcoObj ? aggragateEcoObj["PctCropland"] : perimeterLandCover["PctCropland"], 'fill': '#D3AA5F'},
    {'name': 'Developed', 'percent': aggragateEcoObj ? aggragateEcoObj["PctDevelop"] : perimeterLandCover["PctDevelop"], 'fill': '#993131'},
    {'name': 'Grassland', 'percent': aggragateEcoObj ? aggragateEcoObj["PctGrass"] : perimeterLandCover["PctGrass"], 'fill': '#918652'},
    {'name': 'Scrubland', 'percent': aggragateEcoObj ? aggragateEcoObj["PctShrub"] : perimeterLandCover["PctShrub"], 'fill': '#4F482A'},
    {'name': 'Snow / Ice', 'percent': aggragateEcoObj ? aggragateEcoObj["PctSnowIce"] : perimeterLandCover["PctSnowIce"], 'fill': '#EDEDEB'},
    {'name': 'Water', 'percent': aggragateEcoObj ? aggragateEcoObj["PctWater"] : perimeterLandCover["PctWater"], 'fill': '#054F8C'},
    {'name': 'Wetlands', 'percent': aggragateEcoObj ? aggragateEcoObj["PctWetlands"] : perimeterLandCover["PctWetlands"], 'fill': '#028B9C'}
                        ]
console.log(landCoverArray)
  let placeholderPercent = 0
                      
  landCoverArray.map(biome => {
    console.log(biome)
    biome.percent = Math.round(biome.percent)
    
    if (biome.percent < 10) {
      
      placeholderPercent += biome.percent;
      
      biome.percent = 0;  
    }    

  });

   const otherPercent = { 'name': 'Other', 'percent' : parseFloat(placeholderPercent.toFixed(0)), 'fill': '#D9C7AE' }
   landCoverArray.push(otherPercent)
  
   console.log(landCoverArray)
  renderLandCoverGraph(landCoverArray);

}

const renderLandCoverGraph = (landCoverArray) => {

  d3.select('#landcover-graph')  
  .remove();
  
  document.querySelector('#landcover-data-control').innerText = ``

  const landCoverArrayData = landCoverArray.filter(entry => entry.percent);
  console.log(landCoverArrayData)

  
  if(landCoverArrayData.length === 0){
    
    const noLandCoverData = document.createElement('h4');
    
    noLandCoverData.setAttribute("class", "bold");
    noLandCoverData.innerHTML = 'No information available';
    
    return document.querySelector('#landcover-data-control').append(noLandCoverData)
  }


  const colorScheme = d3.scaleOrdinal()
                          .domain(landCoverArrayData)
                          .range(['#005948', '#6E726B', '#D3AA5F', '#993131', '#918652', '#4F482A', '#EDEDEB', '#028B9C', '#054F8C', '#D9C7AE']);
  
  const svg = d3.select('#landcover-chart')
    .append('div')
      .attr('id', 'landcover-graph')
    .append('div')
      .style('position', 'relative')
    .append('svg')
      .attr('height', 200)
      .attr('width',  320)
      .style('display', 'block')
      .style('margin', '20px auto')
      .attr('id', 'landcover-svg');

  const svgBackground = d3.select('#landcover-graph div')
    .insert('div','svg')
    .style('position', 'absolute')
    .style('top', '13%')
    .style('left', '28%')
    .style('width', '150px')
    .style('height', '150px')
    .style('border-radius', '50%')
    .style('background-color', 'rgb(03, 34, 53)')
    .style('z-index', -1);

  svg;
  svgBackground;

  const landcoverSVG = d3.select('#landcover-svg'),
        width = landcoverSVG.attr("width"),
        height = landcoverSVG.attr("height"),
        radius = Math.min(width, height) / 2;

  const g = landcoverSVG.append('g')
                        .attr('transform', `translate(${width / 2}, ${height / 2})`);

  
  
                        
  const text = landcoverSVG.append('g')
                        .attr('transform', `translate(${width / 2}, ${height / 2})`);


  const pie = d3.pie()
                .value((d) => d.percent);

  const pieArc = d3.arc()
                      .outerRadius(radius * 1.0)
                      .innerRadius(radius * 0.7);

  const piePiece = g.selectAll('arc')
    .data(pie(landCoverArrayData))
    .enter(); 
  
  piePiece.append('path')
            .attr('d', pieArc)
            .attr('fill', (d) => (d.data.fill))
        //text appears while hovering over corresponding doughtnut 
          .on('mouseover', (e, d, i) => {
            text.append('text')
              .attr('dy', '1em')
              // .attr('dx', '-1.5em')
              .attr('text-anchor', 'middle')
              .attr('class', 'percentage')
              .text(`${d.value}%`)
            text.append('text')
              // .attr('dy', 'em')
              // .attr('dx', '-2em')
              .attr('text-anchor', 'middle')
              .attr('class', 'landcover')
              .text(`${d.data.name}`)
          })
          .on('mouseout', () => {
            text.select('.percentage').remove()
            text.select('.landcover').remove()
          });

        
};

//FIRE CONTAINMENT 
const containmentBar =  (containment) => {
  
  //this section is where to write the d3 code for the 'containment bar'. Return the variable 
  d3.select('#containment-bar')  
  .remove();

  if (containment === 'Not reported'){
    document.getElementById('containment-text').innerHTML =  `<h4 class = "bold trailer-0">${containment}</h4>`
  } else {

    const data = [100.01, containment]
    
    
    const barColors = d3.scaleOrdinal()
    .domain(data)
    .range(['#021a26', '#FFBA1F',])
  
    const SVGcontainer = d3.select('#containment').append('div')
    .attr('id', 'svgContainer')
  
    const height = 60;
    const width = 185;

    const barSVG = d3.select('#svgContainer').append('svg')
      .attr('class', 'bar')
      .attr('id','containment-bar')
      .style('margin', '6px 5px 0')
      .attr("width", '100%')
      .attr("height", '85%')
      .attr('viewBox',`0 0 ${width} 40` )
      .attr('preserveAspectRatio', 'none')
    .append("g")
      .attr("transform", "translate( 0, -1.5 )");
      

    const statusBar = d3.scaleLinear()
      .domain([0, d3.max(data)])
      .range([0, (width)-30]);

    barSVG.selectAll('rect')
      .data(data)
      .enter().append('rect')
        .attr('width', statusBar)
        .attr('height', 20)
        .attr('fill', d => barColors(d))
        .attr('dy', '0.1');

    barSVG.append("text")
      .attr("dy", "2em")
      .attr("dx", "1.5em")
      .attr("x", containment*((width-35)/100))
      .attr('text-anchor', 'end')
      .attr('fill', '#ffb600')
      .style('font-size', '1.3rem')
      .style('font-weight', 'bold')
    .text(`${containment}%`)
     
    }
  }

  //Population Bar Chart
  const populationBarGraph = ( populationData ) => {
    console.log(populationData)

    const populationDataValue = populationData.reduce(
      (a,b) => a + b.data, 0
      
    )

    const originalWidth = 220;
    const originalHeight = 135;
    const margin = {
      top: 15,
      right: 10,
      left: 20,
      bottom: 20
    };

    //clear out the existing chart
     d3.select('#population-graph')  
      .remove();
      document.querySelector('#population-graph-data-control').innerText = '';

    if(!populationDataValue) {
      document.querySelector('#population-graph-label').innerHTML = ''
      document.querySelector('#population-graph-data-control').setAttribute('style', "margin: 50% 0; display: block; text-align: center;")
      document.querySelector('#population-graph-data-control').innerText = `No available data`
      return
    };

    d3.select('#population-breakdown')
    .append('div',"div")
      .attr('id', 'population-graph')
      .style('width', `100%`)
      .style('height', `100%`)
    .append('svg')
      .attr('id', 'population-svg');

      
      //set up the svg container
      const svg = d3.select('#population-svg')
      .attr('height', '100%')
      .attr('width', '100%')
      .attr('viewBox', "0 -28 220 188")
      .attr('preserveAspectRatio', 'xMidYMax')
      .append('g')
      .attr("transform", "translate( 0, 0 )");
      
      
      const g = svg.append('g');


    //set up the Scales
    const xScale = d3.scaleBand()
      .domain(populationData.map((d, i) => d.name))
      .range([0, originalWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(populationData, d => d.data)])
      .range([originalHeight, 0]);
    
    //set up the axes
    const xAxis = d3.axisBottom(xScale)
    const yAxis = d3.axisLeft(yScale)

    g.call(xAxis)
      .attr('transform', `translate(0, ${originalHeight})`);
    
    //set up the svg data
    svg.selectAll('.bar')
      .data(populationData)
      .enter().append('rect')
        .attr('class','rect-bar')
        .attr('x', (d, i) => xScale(d.name, i))
        .attr('y', d => yScale(d.data))
        .attr('width', xScale.bandwidth())
        .attr('height', d => originalHeight - yScale(d.data))
        .attr('fill', '#07698C')
      .on('mouseover', (e, d) => {
        svg.append('text')
          .attr('class', 'pop')
          .attr('x', xScale(d.name))
          .attr('y', yScale(d.data))
          .attr('dy', '-0.5em')
          .attr('dx', `${d.data < 10 ? '0.7em' :'0.25em'}`)
          .attr('transform', `translate(${d.data > 999 ? -6 : 0}, 0)`)
          .attr('fill', '#ffb600')
          .style('font-weight', 'bold')
        .text(d.data.toLocaleString())
      })
      .on('mouseout', () => {
        svg.select('.pop').remove()
      })
      
      // const populationGraphLabel = document.createElement('p');
      // populationGraphLabel.setAttribute('style', 'text-align: center; font-size: 0.875rem; margin: 0 auto; width: 75%; ');
      // populationGraphLabel.setAttribute('id', 'population-graph-label');
      // populationGraphLabel.append('AGE IN YEARS');
      
      // const spacer = document.createElement('p');
      //  spacer.setAttribute('style', 'width: 25%;');
      

      document.querySelector('#population-graph-spacer').innerHTML = ''
      document.querySelector('#population-graph-label').innerHTML = ''
      
      document.querySelector('#population-graph-spacer').setAttribute('style', 'width: 25%;'); 
      // document.querySelector('#population-graph-spacer').innerHTML = `<div style = 'width: 25%;'></div>`
      document.querySelector('#population-graph-label').setAttribute('style', 'text-align: center; font-size: 0.875rem; margin: 0 auto; width: 75%;'); 
      document.querySelector('#population-graph-label').innerHTML = `AGE IN YEARS`

    // document.querySelector('#label-spacer') ? document.querySelector('#people-container').remove(spacer) : null;
    // document.querySelector('#people-container').append(spacer);
    // document.querySelector('#population-graph-label') ? document.querySelector('#population-graph-label').remove(populationGraphLabel) : null;
    // document.querySelector('#people-container').append(populationGraphLabel)

  }

  //english speaking population
  const englishBarGraph = ( englishSpeakingPopulation) => {
  console.log('bargraph Called')
  console.log(englishSpeakingPopulation.value)

  d3.select('#english-percent-bar')
  .remove();

  d3.select('#english-pop-header', 'text')
   .remove()

  const range = 350;
  const height = 75;
  const width = 350;
  
  const margin = {
    top: 0,
    right: 10,
    left: 10,
    bottom: 10
  };
  
  d3.select('#english-pop-percentage')
    .insert('div',"div")
      .attr('id', 'english-percent-bar')
      .attr('width', '100%')
      .attr('height', '100%')
    .append('svg')
      .attr('id', 'english-speaking-svg');


  const data = [100.01, englishSpeakingPopulation.value]
  const barText = data[1] === 'NaN' ? `No data` : `${data[1]}%`
  
  const barColors = d3.scaleOrdinal()
                        .domain(data)
                        .range(['#032235', '#07698C',])

    const barSVG = d3.select('#english-speaking-svg')
      .attr('class', 'bar')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox',`0 0 ${width} ${height}` )
      .attr('preserveAspectRatio', 'none')
      

  const g = barSVG.append('g')
          .attr('transform', `translate(${width / 2}, ${height / 2})`);


    const percentBar = d3.scaleLinear()
      .domain([0, d3.max(data)])
      .range([0, range]);

    barSVG.selectAll('rect')
      .data(data)
      .enter().append('rect')
        .attr('width', percentBar)
        .attr('height', 30.01)
        .attr('fill', d => barColors(d));

    barSVG.append("text")
      .attr("dy", "1.4em")
      .attr("dx", "1.5em")
      .attr("x", (range/2))
      .attr('text-anchor', 'end')
      .style('fill', `${barText.length > 6 ? '#07698C' : 'white'}`)
      .style('font-weight', 'bold')
    .text(barText);
    

    g.insert('text')
      .attr('id','english-pop-header')
      .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      .text('SPEAKS ENGLISH')
      .attr('fill', '#efefef');
  }

//Population that has a vehicle
  const vehiclePercentageBar = ( populationWithVehicle ) => {

    d3.select('#vehicle-percent-bar')
    .remove();
    
    d3.select('#vehicle-pop-header')
    .remove();

  const range = 350;
  const height = 75;
  const width = 350;
  
  const margin = {
    top: 0,
    right: 10,
    left: 10,
    bottom: 10
  };
  
  d3.select('#vehicle-pop-percentage')
    .insert('div',"div")
      .attr('id', 'vehicle-percent-bar')
        .attr('width', '100%')
        .attr('height', '100%')
    .append('svg')
      .attr('id', 'vehicle-svg');


  const data = [100.01, populationWithVehicle.value];
  const barText = data[1] === 'NaN' ? `No data` : `${data[1]}%`;

  const barColors = d3.scaleOrdinal()
                        .domain(data)
                        .range(['#032235', '#07698C',])

    const barSVG = d3.select('#vehicle-svg')
      .attr('class', 'bar')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox',`0 0 ${width} ${height}` )
      .attr('preserveAspectRatio', 'none')
      
    const g = barSVG.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const percentBar = d3.scaleLinear()
      .domain([0, d3.max(data)])
      .range([0, range]);

    barSVG.selectAll('rect')
      .data(data)
      .enter().append('rect')
        .attr('width', percentBar)
        .attr('height', 30.01)
        .attr('fill', d => barColors(d));


    barSVG.append("text")
      .attr("dy", "1.4em")
      .attr("dx", "1.5em")
      .attr("x", (range/2))
      .attr('text-anchor', 'end')
      .style('fill', `${barText.length > 6 ? '#07698C' : 'white'}`)
      .style('font-weight', 'bold')
    .text(barText);

    g.insert('text')
      .attr('id','vehicle-pop-header')
      .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      .text('HAS VEHICLE')
      .attr('fill', '#efefef');

  }

//WILDFIRE HAZARD POTENTIAL BAR GRAPH
    
  const formatWildfireRiskData = ({aggragateEcoObj , consolidatedWHPClass}) => {
    console.log(aggragateEcoObj || consolidatedWHPClass)

    const wildfireRiskData = [
      {name:"VERY HIGH", value: aggragateEcoObj ? aggragateEcoObj.WHPClass["Very High"] : consolidatedWHPClass['Very High']},
      {name: "HIGH", value: aggragateEcoObj ? aggragateEcoObj.WHPClass["High"] : consolidatedWHPClass['High']},
      {name: "MODERATE", value: aggragateEcoObj ? aggragateEcoObj.WHPClass["Moderate"] : consolidatedWHPClass['Moderate']},
      {name: "LOW", value: aggragateEcoObj ? aggragateEcoObj.WHPClass["Low"] : consolidatedWHPClass['Low']},
      {name: "VERY LOW", value: aggragateEcoObj ? aggragateEcoObj.WHPClass["Very Low"] : consolidatedWHPClass['Very Low']},
  ];

    console.log({ wildfireRiskData })

  wildfirePotentialGraph({ wildfireRiskData })
  };

  const wildfirePotentialGraph = ({ wildfireRiskData }) => {
    
    const data = wildfireRiskData
    console.log(data)

      //clear out the existing chart
      d3.select('#wildfire-risk-graph')  
      .remove();
      document.querySelector('#wildfire-risk-data-control').innerText = ``
      
    if(data.reduce((a,b) => a + b.value, 0) === 0){
     document.querySelector('#wildfire-risk-data-control').innerText = `No data available`
     return
    }

  
      const width = 340;
      const height = 170;
      const margin = {
        top: 15,
        right: 5,
        left: 45,
        bottom: 10
      };

      
      const innerHeight = height - margin.top - margin.bottom;

      d3.select('#wildfire-risk')
	    .append('div',"div")
        .attr('id', 'wildfire-risk-graph')
        .attr('width', '100%')
        .attr('height', '100%')
        // .style('margin-left', `${margin.left}px`)
        // .style('margin-right', `${margin.left}px`)
      .append('svg')
        .attr('id', 'wildfire-risk-graph-svg')
        .attr('transform', `translate(${margin.left}, 0 )`)

  const barColors = d3.scaleOrdinal()
                        .domain(data)
                        .range(['#993131', '#B6673E','#D3AA5F', '#C1B999', '#707767']);

      //set up the svg container
      const svg = d3.select('#wildfire-risk-graph-svg')
        .attr('height', '100%')
        .attr('width', '100%')
        .attr('viewBox',`0 0 ${width} ${height}` )
        .attr('preserveAspectRatio', 'none')
        .style('overflow', 'visible');        
      
      //set up the group for the barGraph
      const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
        

      //formating the scale and data source for the axes
      const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range([0, width]);
      
      const yScale = d3.scaleBand()
          .domain(data.map(d => d.name))
          .range([0, innerHeight])
          .padding(-0.1);
      
      //assigning the scales(and data) to the axes
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);

      g.append('g')
      .call(yAxis)
  	  .selectAll('.domain, .tick line')
  		  .remove();
      

      const xAxisG = g.append('g').call(xAxis)
        .attr('transform', `translate(0, ${height})`);

      xAxisG.selectAll('.domain, .tick')
      .remove();

      //const rect = svg.selectAll('.bar')
      svg.selectAll('.bar')
        .data(data)
        .enter().append('g')
          .attr('transform', `translate(${margin.left}, 22)`)
        .append('rect')
          .attr('class', 'fire-rect-bar')
          .attr('y', (d, i) => yScale(d.name, i))
          .attr('width', d => (d.value > 0 ? (d.value*200) : (0.02*200)))
          .attr('height', "20px")
          .attr('fill', d => barColors(d.name));
        
      svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('text')
        .attr('transform', `translate(${margin.left + 10}, 38)`)
            .attr('class', 'riskPercent')
            .attr('x', (d) => (d.value)*195)
            .attr('y', (d, i) => yScale(d.name, i))
            .attr('fill', '#EFEFEF')
            .style('font-weight', 'bold')
          .text(d => (d.value > 0 ? `${Math.round(d.value*100)}%` : '0%'))
  }

  
//RENDERING UI CONTENT

  const toggleItemContentVisibility = () => {
    console.log('toggler');
    
    console.log(sideBarInformation.style.display)
    sideBarInformation.style.display = 'initial';
  };

  const renderWeatherHeader = async () => {
    const weatherContentHeader = infoItemHeader[1].innerHTML = `<p class = "trailer-0 padding-trailer-0 sectionHeader">WEATHER</p>
                                                                <p class = "trailer-0 padding-leader-0 sectionSubHeader">LOCATION CLICKED</p>`;

    weatherContentHeader
  };

  const renderDroughtStatus = ( droughtStatus ) => {

    const drought = document.querySelector("#drought-condition").innerHTML = `
      <div style = "display: flex;">
          <div style = "width: max-content;">
            <p style="margin-bottom: 0">DROUGHT STATUS</p>
          </div>
          <div style = "margin: -6px 0 0 10px;">
            <h4 class = "bold trailer-0"> 
            ${droughtStatus}
            </h4>
          </div>
        </div>`;

    drought;
  }

  const clearWeatherGrid = () => {
    document.querySelector('#temp-wind-aq').innerHTML = '';
  }

  const renderWeatherInformation = ({ temp, wind, airQualityToday, airQualityTomorrow }) => {

                     
    const aqToday = airQualityToday
    const aqTomorrow = airQualityTomorrow
    
    const grid = document.querySelector('#temp-wind-aq').innerHTML = `
      <div style = "
                    display: grid; 
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    grid-template-rows: auto auto auto;
                    gap: 0px;
                    margin: auto;">
                        <div class="item-1" style = "margin: 15px 0 10px -5px; text-align: center;">
                          <span class = "unit-conversion" style = "margin: 0 0 0 0; text-decoration: underline #FFBA1F 3px; text-underline-position: under; text-underline-offset: 2px; cursor: default; cursor: pointer;">&degF MPH
                          </span>
                          </br>
                          <span class = "unit-conversion" style = "cursor: pointer; ">&degC KM/H
                          </span>
                        </div>
                        <div class="item-2" style = "padding: 25px 0; text-align: center;">
                          <span>TODAY</span>
                        </div>
                        <div class="item-3" style = "padding: 25px 0; text-align: center;">
                          <span>TOMORROW</span>
                        </div>
                        <div class="item-4">
                          <p style = "margin: 1rem; text-align: center;">TEMP</p>
                        </div>
                        <div id = "today-temp" 
                        style = "border: 1px solid; border-style: none solid none solid;">
                          <p style="margin: 1rem; text-align: center;">${temp.todayF}&deg F</p>
                        </div>
                        <div id = "tomorrow-temp">
                           <p style="margin: 1rem; text-align: center;">${temp.tomorrowF}&deg F</p>
                        </div>
                        <div class="item-7" 
                        style = "border: 1px solid; border-style: solid none solid none;">
                          <p style = "margin: 1rem; text-align: center;">WIND</p>
                        </div>
                        <div id = "today-wind" 
                        style = "border: 1px solid;">
                          <p style="margin: 1rem; text-align: center;"> ${wind.today.mph} </p>
                        </div>
                        <div id= "tomorrow-wind" 
                        style = "border: 1px solid; border-style: solid none solid none;">
                        <p style="margin: 1rem; text-align: center;"> ${wind.today.mph} </p></div>
                        <div style = "display: flex;">
                          <p  style = "margin-top: 20px; text-align: center; line-height: 20px;">AIR QUALITY INDEX</p>
                        </div>
                        <div id = "aqi-current" 
                        style = "border: 1px solid; border-style: none solid none solid">
                          <p style="margin: auto;
                                    text-align: center;
                                    padding: 20px 5px;
                                    line-height: 21px;"> ${aqToday} </p>
                        </div>
                        <div id = "aqi-forecast">
                          <p style="margin: auto;
                                    text-align: center;
                                    padding: 20px 5px;
                                    line-height: 21px;""> ${aqTomorrow} </ptrailer-0>
                        </div>
                      </div>
    `
    grid

    changeWeatherMetrics({ temp, wind })
  }

  const changeWeatherMetrics = ({ temp, wind }) => {
      
      const todayTempEL = document.querySelector('#today-temp');
      const tomorrowTempEl = document.querySelector('#tomorrow-temp');
      const todayWindEL = document.querySelector('#today-wind');
      const tomorrowWindEL = document.querySelector('#tomorrow-wind');

                     
    const todayTempF = `<p style="margin: 1rem; text-align: center;">${temp.todayF}&degF</p>`;
    const todayTempC = `<p style="margin: 1rem; text-align: center;">${temp.todayC}&degC</p>`;
    const tomorrowTempF = `<p style="margin: 1rem; text-align: center;">${temp.tomorrowF}&degF</p>`;
    const tomorrowTempC = `<p style="margin: 1rem; text-align: center;">${temp.tomorrowC}&degC</p>`;
    const windTodayMPH = `<p style="margin: 1rem; text-align: center;"> ${wind.today.mph} </p>`;
    const windTodayKPH = `<p style="margin: 1rem; text-align: center;"> ${wind.today.kph} </p>`;
    const windTomorrowMPH = `<p style="margin: 1rem; text-align: center;"> ${wind.tomorrow.mph} </p>`;
    const windTomorrowKPH = `<p style="margin: 1rem; text-align: center;"> ${wind.tomorrow.kph} </p>`;

      const metric = document.querySelectorAll(".unit-conversion")
      metric.forEach((item) => {
        item.addEventListener('click', (event) => {
          
          !event.target.style.textDecoration
          ? (metric.forEach((item) => {item.style.textDecoration = ''}), event.target.style.textDecoration = 'underline #FFBA1F 3px', event.target.style.textUnderlinePosition = 'under', event.target.style.textUnderlineOffset = '2px')
          : null;
          
          event.target.innerText.includes('F')
          ? (todayTempEL.innerHTML = todayTempF,
             tomorrowTempEl.innerHTML = tomorrowTempF, 
             todayWindEL.innerHTML = windTodayMPH,
             tomorrowWindEL.innerHTML = windTomorrowMPH
             )
          : (todayTempEL.innerHTML = todayTempC, 
             tomorrowTempEl.innerHTML = tomorrowTempC,
             todayWindEL.innerHTML = windTodayKPH,
             tomorrowWindEL.innerHTML = windTomorrowKPH
             )

          
        })
      })

    };
 
  
  const totalPopulationUIRender = async ({ totalRadiusPopulation, perimeterPopulation }) => {
    console.log(totalRadiusPopulation || perimeterPopulation)

    const containerSubheader = totalRadiusPopulation
                             ? 'WITHIN 2 MILE RADIUS'
                             : 'WITHIN FIRE PERIMETER'

    const poepleContentHeader = infoItemHeader[2].innerHTML = `<p class = "trailer-0 sectionHeader">POPULATION</p>
                                                               <p class = "trailer-0 sectionSubHeader">${containerSubheader}</p>`;

    poepleContentHeader
    
    
    const population = (() => {
      if(totalRadiusPopulation){
        return totalRadiusPopulation.totalPopulation
      } else if(perimeterPopulation){
        return perimeterPopulation.totalPopulation  
      } else {
        return 'No data'
      }
    })();
    
    const populationInPoverty = (() => {
      if(totalRadiusPopulation){
        return totalRadiusPopulation.percentofPopulationInPoverty
      } else if(perimeterPopulation){
        return perimeterPopulation.percentofPopulationInPoverty
      } else {
        return 'No data'
      }
    })();

    const populationWithDisability = (() => {
      if(totalRadiusPopulation){
        return totalRadiusPopulation.percentofPopulationWithDisability
      } else if(perimeterPopulation){
        return perimeterPopulation.percentofPopulationWithDisability  
      } else {
        return 'No data'
      }
    })();
    
    document.querySelector('#general-population').innerHTML = ``
    document.querySelector('#general-population').innerHTML = 
    `
      <div style = "margin-bottom: 10px;">
      <h4 class= "bold">${population}</h4>
      <p style = "margin: -5px auto -5px"> POPULATION </p>
      </div>
    `

    document.querySelector('#disability').innerHTML = `` 
    document.querySelector('#disability').innerHTML = 
    `
    <div style = "margin-bottom: 10px;">
    <h4 class = "bold text-center">${populationWithDisability}</h4>
    <p class= "text-center" style = "margin: -5px auto -5px; text-align: left;">DISABILITY</p>
    </div>
    `

    document.querySelector('#poverty').innerHTML = ``
    document.querySelector('#poverty').innerHTML = 
    `
    <div style = "margin-bottom: 10px;">
    <h4 class = "bold text-center">${populationInPoverty}</h4>
    <p class= "text-center" style = "margin: -5px auto -5px; text-align: left;">POVERTY</p>
    </div>
    `

  }

  const povertyPopulationRender = (povertyPopulation) => {
    
    !povertyPopulation
    ? povertyPopulation = "N/A"
    : povertyPopulation = `${povertyPopulation}%`
    
    if(document.querySelector('#poverty')) {
    document.querySelector('#poverty').remove()
    }
    const povertyDiv = document.createElement('div');

    atRiskDiv.append(povertyDiv);

    povertyDiv.setAttribute('id', 'poverty');

    document.querySelector('#poverty').innerHTML = ''

    document.querySelector('#poverty').innerHTML = 
    `
    <div style = "margin-bottom: 10px;">
    <h4 class = "bold text-center">${povertyPopulation}</h4>
    <p class= "text-center" style = "margin: -5px auto -5px; text-align: left;">POVERTY</p>
    </div>
    `
  }

  const disabledPopulationRender = (disabledPopulation) => {
    console.log(disabledPopulation);

    !disabledPopulation
    ? disabledPopulation = "N/A"
    : disabledPopulation = `${disabledPopulation}%`

    if(document.querySelector('#disability')) {
    document.querySelector('#disability').remove()
  }

    const disableDiv = document.createElement('div');

    atRiskDiv.prepend(disableDiv)
    disableDiv.setAttribute('id', 'disability');

    document.querySelector('#disability').innerHTML = 
    `
    <div style = "margin-bottom: 10px;">
    <h4 class = "bold text-center">${disabledPopulation}</h4>
    <p class= "text-center" style = "margin: -5px auto -5px; text-align: left;">DISABILITY</p>
    </div>
    `
  }

  const housingInfoRender = ({ radiusHousingData, perimeterHousingData }) => {
    console.log(radiusHousingData || perimeterHousingData)

    const containerSubheader = radiusHousingData
                             ? 'WITHIN 2 MILE RADIUS'
                             : 'WITHIN FIRE PERIMETER' 
    
    const poepleContentHeader = infoItemHeader[3].innerHTML = `<p class = "trailer-0 sectionHeader">HOUSING</p>
                                                              <p class = "trailer-0 sectionSubHeader">${containerSubheader}</p>`;

    poepleContentHeader

    const housingUnits = (() => {
      if(radiusHousingData){
        return radiusHousingData.TotalHousingUnits
      } else if(perimeterHousingData){
        return perimeterHousingData.TotalHousingUnits  
      } else {
        return 'No data'
      }
    })();
    
    const medianValue = (() => {
      if(radiusHousingData){
        return radiusHousingData.MedianValue
      } else if(perimeterHousingData){
        return perimeterHousingData.MedianValue
      } else {
        return 'No data'
      }
    })();

    document.querySelector('#housing-container-stats').innerHTML = `
      <div style = "margin-bottom: 10px">
      <h4 class= "bold">${housingUnits}</h4>
        <p style = "margin-bottom: -5px;">TOTAL HOUSING UNITS </p> 
      </div>
      <div>
      <h4 class = "bold" style = "line-height: 1.2;">${medianValue}</h4>
        <p style = "margin-bottom: -5px;"> MEDIAN HOUSING VALUE </p>
      </div>
    `
  }

  const habitatInfoRender = ({ aggragateEcoObj, perimeterEcology }) => {
    console.log(perimeterEcology || aggragateEcoObj);

    const containerSubheader = aggragateEcoObj
                             ? 'WITHIN 2 MILE RADIUS'
                             : 'WITHIN FIRE PERIMETER'

    const habitatContentHeader = infoItemHeader[4].innerHTML = `<p class = "trailer-0 sectionHeader">ECOSYSTEM</p>
                                                                <p class = "trailer-0 sectionSubHeader">${containerSubheader}</p>`;

    habitatContentHeader

    const ecoRegion = (() => {
      if(aggragateEcoObj){
        return typeof(aggragateEcoObj.L3EcoReg) !== "string" ? aggragateEcoObj.L3EcoReg[0][0] : aggragateEcoObj.L3EcoReg;
      } else if(perimeterEcology){
        return perimeterEcology.L3EcoReg
      } else {
        return 'No data'
      }
    })();

    const landformType = (() => {
      if(aggragateEcoObj){
        return typeof(aggragateEcoObj.LandForm) !== "string" ? aggragateEcoObj.LandForm[0][0] : aggragateEcoObj.LandForm;
      } else if(perimeterEcology){
        return perimeterEcology.LandForm
      } else {
        return 'No data'
      }
    })();

    const biodiversity = (() => {
      if(aggragateEcoObj){
        return typeof(aggragateEcoObj.RichClass) !== "string" ? aggragateEcoObj.RichClass[0][0] : aggragateEcoObj.RichClass;
      } else if(perimeterEcology){
        return perimeterEcology.RichClass 
      } else {
        return 'No data available'
      }
    })();

    const criticalHabitat = (() => {
      if(aggragateEcoObj){
        return aggragateEcoObj.CritHab
      } else if(perimeterEcology){
        return perimeterEcology.CritHab  
      } else {
        return 'None present'
      }
    })();

    const protectedAreas = (() => {
      if(aggragateEcoObj){
        return aggragateEcoObj.OwnersPadus
      } else if(perimeterEcology){
        return perimeterEcology.OwnersPadus  
      } else {
        return 'None present'
      }
    })();

    const forestGroup = (() => {
      if(aggragateEcoObj){
        return typeof(aggragateEcoObj.ForestTypeGroup) !== "string" ? aggragateEcoObj.ForestTypeGroup[0][0] : aggragateEcoObj.ForestTypeGroup;
      } else if(perimeterEcology){
        return perimeterEcology.ForestTypeGroup
      } else {
        return 'No data'
      }
    })();

    const potentialCarbon = (() => {
      if(aggragateEcoObj){
        return aggragateEcoObj.SumCarbon
      } else if(perimeterEcology){
        return perimeterEcology.SumCarbon  
      } else {
        return 'None present'
      }
    })();
    
      document.querySelector('#ecoregion').innerHTML = `
     <div>
        <p class = "trailer-0">ECOREGION</p>
        <div style = "margin-bottom: 15px;">
          <h4 class = "bold" style = "margin-top: -7px; ">${ecoRegion}</h4>
        </div>
      </div>`;

      document.querySelector('#landform').innerHTML = `
      <div>
          <p class = "trailer-0">LANDFORM TYPE</p>
          <div style = "margin-bottom: 15px;">
            <h4 class = "bold" style = "margin-top: -7px;">${landformType}</h4>
          </div>
        </div>`;

      document.querySelector('#biodiversity').innerHTML = `
    <div style = "margin-bottom: 1.5625rem;">
        <div style = "width: 100%;">
          <div>
          <p class = "trailer-0">BIODIVERSITY</p>
        </div>
        <div style ="width: 100%; display: flex; text-align: center;">
          <div style = "width: 50%; text-align: center; align-self: center;">
          <h4 class = "bold">${biodiversity}</h4>
              <p style ="margin-bottom: 5px; margin-top: 5px;">Imperiled Species Biodiversity</p>
          </div>
          <div style = "width: 50%;"> 
            <img src="https://www.arcgis.com/sharing/rest/content/items/668bf6e91edd49d1bb8b3f00d677b315/data"
              style="width:60px; height:60px;
              // margin-right: 10px; 
              display: inline-flex;" 
              viewbox="0 0 70 70" 
              class="svg-icon" 
              type="image/svg+xml">
            <img src="https://www.arcgis.com/sharing/rest/content/items/bc5dc73ad7d345de840c128cc42cc938/data"
              style="width:60px; height:60px; 
              display: inline-flex;" 
              viewbox="0 0 70 70" 
              class="svg-icon" 
              type="image/svg+xml">
            <img src="https://www.arcgis.com/sharing/rest/content/items/96a4af6a248b4da48f1b7bd703f88485/data"
              style="width:60px; height:60px;
              // margin-right: 7px;
              display: inline-flex;" 
              viewbox="0 0 70 70" 
              class="svg-icon" 
              type="image/svg+xml">
            <img src="https://www.arcgis.com/sharing/rest/content/items/3c9e63f9173a463ba4e5765c08cf7238/data"
              style="width:60px; height:60px; 
              display: inline-flex;" 
              viewbox="0 0 70 70" 
              class="svg-icon" 
              type="image/svg+xml">
          </div>
        </div>
      </div>`;

      document.querySelector('#criticalHabitat').innerHTML = `
      <div style = margin-top: 10px>
        <p style = "margin-bottom: 2px;">CRITICAL HABITAT DESIGNATION</p>
        <div class = "ecoregionInformation">
          <h4 class = "bold">${criticalHabitat}</h4>
        </div>
      </div>
      `;

      document.querySelector('#protectedAreas').innerHTML = `
      <div>
        <p style = "margin-bottom: 2px;">PROTECTED AREAS, TRIBAL LANDS, </br>& WILDERNESS AREAS</p>
        <div class = "ecoregionInformation">
          <p>${protectedAreas}</p>
        </div>
      </div>
      `;

      document.querySelector('#forestType').innerHTML = `
      <div>
        <p style = "margin-bottom: 2px;">PREDOMINANT FOREST TYPE GROUPS</p>
        <div class = "ecoregionInformation">
          <h4 class = "bold">${forestGroup}</h4>
        </div>
      </div>
      `;
        
      document.querySelector('#carbon').innerHTML = `
      <div  style="margin-top: 15px;>
        <p style = "margin-bottom: 2px;">POTENTIAL CARBON LOSS</p>
        <div class = "ecoregionInformation">
          <div style = "position: relative;">            
            <h4 class = "bold">${potentialCarbon.toLocaleString()} tons</h4>
            </div>
          </div>
          
      </div>
      `;
    }

});