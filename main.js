
require([
          "esri/config",
          "esri/WebMap",
          "esri/views/MapView",
          "esri/widgets/Search",
          "esri/widgets/Home",
          "esri/widgets/ScaleBar",
          "esri/Graphic",
          "esri/layers/GraphicsLayer",
          "esri/core/reactiveUtils",
          "esri/geometry/Point",
          "esri/geometry/geometryEngine"
], (esriConfig, WebMap, MapView, Search, Home, ScaleBar, Graphic, GraphicsLayer, reactiveUtils, Point, geometryEngine) => {
    
  'use strict';

  console.log("so far...")
  
// GLOBAL VARIABLES

  //DOM VARIABLES
  const sideBarContainer = document.querySelector("#sideBar");
  const sideBarInformation = document.getElementById('sideBarInformation');
  const fireListEl = document.querySelector('#fire-list');
  const fireListBtn = document.querySelector('#fire-list-Btn');
  const fireListSorting = document.querySelector('#fireSorting');
  const infoItemHeader = document.getElementsByClassName('item-header');
  const infoItemContent = document.getElementsByClassName('item-content');
  const atRiskDiv = document.querySelector('#at-risk-population');
  const fireListDate  = document.getElementsByClassName('fire-list-date')
  const fireListItem  = document.getElementsByClassName('fire-item')
  
  let dateSortedList = [];
  
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

  //NOTE: Change this. Take the variable names and create function using the layer declaration from the when() instance. See if that's doable.
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
    map: webmap,
    spatialReference: 102100,
    popup: {
      popup: null,
      autoOpenEnabled: false,
    }
  });

  const graphicsLayer = new GraphicsLayer({
    graphics:[]
  })
  webmap.add(graphicsLayer);
  webmap.layers.reorder(graphicsLayer, 11)

//WIDGETS
  const searchWidget = new Search({
    view: mapView,
    resultGraphicEnabled: false,
    popupEnabled: false,
    container: searchContainer
  });
  mapView.ui.add(searchWidget, "top-left");

  const homeWidget = new Home({
  view: mapView,
  container: homeContainer
  });
  mapView.ui.add(homeWidget, "top-left");

  homeWidget.goToOverride = () => {
  console.log('homehome')
  return mapView.goTo({ 
                      zoom: 5,
                      center: [260, 39]
                    });
};

  const scaleBar = new ScaleBar({
    view: mapView
  });

  mapView.ui.add(scaleBar, {
  position: "bottom-right"
  });

  const loadMapview = (() => {
    mapView.when()
      .then(() => {
        console.log('mapView loaded')

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
        mapView.goTo({
                    zoom: 5,
                    center: [260, 39]
                  });
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
    : (uncheckLayerVisbility(), layerListBackground.style.background = 'none') 
  }

  const changelayerListButtonText = () => {
    console.log('button click')
    
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
    });
  })()

  const toggleBurnedAreasVisibility = (() => {

    burnedAreasCheckbox.addEventListener('change', () => {
    burnedAreasFillLayer.visible = burnedAreasCheckbox.checked;
    burnedAreasPerimeterLayer.visible = burnedAreasCheckbox.checked;
    toggleLegendDivVisibility(burnedAreasLegend);
    });
  })();

  const toggleCensusPopulationVisibility = (() => {
    censusPointsCheckbox.addEventListener('change', () => {
      censusLayer.visible = censusPointsCheckbox.checked;
      toggleLegendDivVisibility(censusPointLegend);
    });
  })();

   const uncheckLayerVisbility = () => {
    document.querySelectorAll('.auto-checkbox').forEach(checkbox => {
      
      checkbox.checked = false;

      AQITodayLayer.visible = checkbox.checked;
      AQITomorrowLayer.visible = checkbox.checked;
      weatherWatchesAndWarningsLayer.visible = watchesAndWarningsCheckbox.checked
      burnedAreasFillLayer.visible = burnedAreasCheckbox.checked
      burnedAreasPerimeterLayer.visible = burnedAreasCheckbox.checked
      censusLayer.visible = censusPointsCheckbox.checked
      
    })
    hideAllLegendDivs();

  };

//MAP GRAPHICS
  const censusTractOutlineGraphic = new Graphic ({
    geometry: {
      type: 'polygon',
    },
    symbol: {
      type: "simple-fill",
      color: [0, 0, 0, 0],
      outline: {
        color: [0, 97, 155],
        width: 2,
      }
    }
  });

  const queryPointGraphic = new Graphic({
    symbol: {
      type: "simple-marker", 
      color: "blue",
      size: 8,
      outline: { 
        width: 1,
        color: "white"
      }
    }
  });

  const hexGraphic = new Graphic({
    geometry: {
      type: 'polygon',
    },
    symbol: {
      type: "simple-fill",
      color: [0, 0, 0, 0],
      outline: {
        color: [250, 250, 250],
        width: 3,
      }
    }
  });
  

//MAP-ORIENTED FUNCTIONS

//MAP POINT GRAPHIC FUNCTION
  const addSearchQueryLocationGraphic = ({location, mapPoint, fireInformation}) => {    
    console.log(mapPoint)
    removeMapPointGraphic()    

    queryPointGraphic.geometry = mapPoint;
    
    mapView.graphics.add(queryPointGraphic);
  };

  const removeMapPointGraphic = async () => {
    mapView.graphics.remove(queryPointGraphic);
    queryPointGraphic.geometry = null;
  }


//RENDER CENSUS SELECTED TRACT
  const renderCensusTract = async (censusTractGeometry) => {
    console.log('this working?')
    
    await removeCensusTractGraphic();

      console.log(mapView.graphics)

    censusTractOutlineGraphic.geometry.rings = censusTractGeometry.rings
      console.log(censusTractOutlineGraphic)
    
    // mapView.graphics.add(censusTractOutlineGraphic)
      console.log(mapView.graphics)

  }

  const removeCensusTractGraphic = async () => {
    mapView.graphics.remove(censusTractOutlineGraphic)
    censusTractOutlineGraphic.geometry.rings = null 
  };

  const renderMapHexes = async (hexRings) => {
    await removeMapHexes();

    hexGraphic.geometry.rings = hexRings.rings
    mapView.graphics.add(hexGraphic)
    
  };
 
  const removeMapHexes = async () => {
    hexGraphic.geometry.rings = null 
    await clearHexes(); 
  };

  const clearHexes = async () => {
    mapView.graphics.remove(hexGraphic);
  };

  const fireGraphic = async ({fireIconGraphicInfo, fireInformation}) => {

    const fireLocation = fireInformation 
                         ? fireInformation[0].split(',')
                         : fireIconGraphicInfo.geometry;
                         
    const fireType = fireInformation
                   ? fireInformation[2]
                   : fireIconGraphicInfo.attributes.incidentType;

    const fireSize = fireInformation    
                   ? fireInformation[3]
                   : fireIconGraphicInfo.attributes.DailyAcres;

    const fireIconGraphic =  new Graphic ({
      geometry: {
        type: 'point',
        x: fireLocation.x || fireLocation[0],
        y: fireLocation.y || fireLocation[1],
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

  await removePreviousFireIcon()

    if(fireType !== 'RX' || 'PERSCRIPTTION BURN') {
      fireIconGraphic.symbol.size = 30
        if(fireSize > 50000){
          fireIconGraphic.symbol.size = 40
        } else if (fireSize < 5000 || fireSize === 'Unreported'){
          fireIconGraphic.symbol.size = 22
        } 
    }
     
    webmap.layers.reorder(graphicsLayer, 12)
    graphicsLayer.graphics.push(fireIconGraphic);
    
  }
  
  const removePreviousFireIcon = async () => {
    graphicsLayer.graphics
    ? graphicsLayer.graphics.pop()
    : null;

  }

const goto = ({ mapPoint, fireInformation }) => {
    fireInformation ? console.log(fireInformation) : console.log(mapPoint);

    if (mapView.zoom >= 8 ) {
      return
    }
    
    let point = null;
    
    if(fireInformation){
    const fireLocation = fireInformation[0].split(',');
    
    point = new Point(
      {
        x: fireLocation[0], 
        y: fireLocation[1],
      }
    )
  };
 
  mapView.goTo(
    {
      zoom: 12,
      target: point ? point : mapPoint,
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
              ? fire[0].attributes.DailyAcres
              : fire.attributes.DailyAcres,
      fireLocation: fire[0]
              ? [fire[0].geometry.x, fire[0].geometry.y]
              : [fire.geometry.x, fire.geometry.y],
      fireType: fire[0]
              ? fire[0].attributes.IncidentTypeCategory
              : fire.attributes.IncidentTypeCategory,
    }
    
    return  (
      `
      <div class = "fire-item padding-left-2" style = "margin-bottom: 15px; cursor: pointer;" value="${fireListItem.fireLocation}, ${fireListItem.fireId}, ${fireListItem.fireType}, ${fireListItem.fireAcres}" > 
        <h5 style ="font-weight: bold; margin-bottom: -4px; color: #ffb600; line-height: 21px;" value="${fireListItem.fireLocation}, ${fireListItem.fireId}, ${fireListItem.fireType}, ${fireListItem.fireAcres}">${fireListItem.fireName} </h5>
        
        <p value="${fireListItem.fireLocation}, ${fireListItem.fireId}, ${fireListItem.fireType}, ${fireListItem.fireAcres}">${fireListItem.fireAcres.toLocaleString()} acres</p>
        
      </div>
      `
      );
    }
    
    return `<p class = "trailer-0 fire-list-date" style = "margin-top: 1rem; cursor: default;">${fire.toUpperCase()}</p>`; 

  });

  document.getElementById('fire-list').innerHTML = [...fires].join("");

    fireListItemClickEvent() 
    fireItemHoverHighlight()     
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
    
    const fireType = fireData.incidentType;
    
    const fireIcon = ({ fireType , fireAge }) => {

      if(fireType == 'WILDFIRE' && fireAge == 'Less than 24 hours') {
      return "https://www.arcgis.com/sharing/rest/content/items/3ce2a29d3c794e288b24fcd39ed1f966/data"
     } else if (fireType === 'WILDFIRE') {
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
                <p style = "font-size: 0.875rem;" class = "trailer-0">INCIDENT TYPE: ${fireType}</p>
                <p style = "font-size: 0.875rem;" class = "trailer-0">START: ${fireDate.toUpperCase()}</p>
              </div>
          </div>
          
          <div>
            <div class = "trailer-0 " style= "margin-top: 10px;"> 
              <span class = "" style = "vertical-align: 2px; margin: 0 5px 0px 103px"> DAY </span>
              <h4 class = "bold trailer-0"> ${fireAge}</h4>
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
    () => mapView.stationary, 
    () => {
      const extentGeometry = mapView.extent
      getFiresByExtent({ extentGeometry })
    },
    {
      intial:true
    }
      
  )

  reactiveUtils.watch(
    () => mapView?.zoom,
    () => {
      console.log(`zoom changed to ${mapView.zoom}`);
      if(!(mapView.zoom >= 5 && mapView.zoom <=8)){
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
      
      if(!(mapView.zoom >= 0 && mapView.zoom <=7)){
        disableMapLayer(watchesAndWarningsCheckbox)
        weatherWatchesAndWarningsLayer.visible = watchesAndWarningsCheckbox.checked
      }else{
        enableMapLayer(watchesAndWarningsCheckbox)
      }
      
      if(!(mapView.zoom >= 12 && mapView.zoom <= 15)){
        disableMapLayer(censusPointsCheckbox)
        censusLayer.visible = censusPointsCheckbox.checked
      }else{
        enableMapLayer(censusPointsCheckbox)
      }
      
      if(!(mapView.zoom >= 8 && mapView.zoom <= 12)){
        disableMapLayer(burnedAreasCheckbox)
        burnedAreasFillLayer.visible = burnedAreasCheckbox.checked
        burnedAreasPerimeterLayer.visible = burnedAreasCheckbox.checked
      }else{
        enableMapLayer(burnedAreasCheckbox)
      }

    });


  searchWidget.on('search-complete', event => {
    console.log(event)
    const location = event.results[0].results[0].feature.geometry
    console.log(location)
    
    // addSearchQueryLocationGraphic({ location });

  });

  mapView.on('click', async (event) => {
    // closeLayerList();
    
    if(queryPointGraphic){
          removeMapPointGraphic();
    };

    await removePreviousFireIcon();

    if(hexGraphic){
      await removeMapHexes();
    }


    let feature;
    
    mapView.hitTest(event, { include: [firePoints, fireArea, firePerimeter]}).then((hitResponse) => {
      console.log('hitTest')
    

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
        const hitTestGeographicResponse = feature.geometry

        console.log(feature)
        
        feature.sourceLayer.title === 'Current Perimeters Outline'
        ? (selectedFireInfoQuery({hitTestResponse}), queryHub({ mapPoint }))
        : (selectedFireInfoQuery({hitTestResponse}), queryHub({ mapPoint }));
        // Below is a function that will add a fireIcon to the map. Commented out for demo.
        //  fireGraphic(feature)
        
      } else {
        infoItemHeader[0].innerHTML = '';
        infoItemContent[0].innerHTML = '';
        const mapPoint = event.mapPoint;
        queryHub({ mapPoint });
        // addSearchQueryLocationGraphic({ mapPoint })
      };

    })

  });

  fireListBtn.addEventListener('click', () => {
    fireListDisplayToggle(); 
    removeCensusTractGraphic();
    removeMapPointGraphic();
    resetFireList();
    removePreviousFireIcon();
    sideBarInformation.style.display = 'none'
  })

  const fireListDisplayToggle = (mapPoint) => {
    console.log(mapPoint)
    console.log(fireListEl.style.display)
    fireListEl.style.display === 'initial' || (mapPoint && fireListEl.style.display)
    ? (fireListEl.style.display = 'none', fireListBtn.style.display = 'initial', sideBarInformation.style.display = 'initial', scrollToTop(), fireListSorting.style.display = 'none')
    : (fireListEl.style.display = 'initial', fireListBtn.style.display = 'none', sideBarInformation.style.display = 'none', fireListSorting.style.display = 'initial');
    console.log(fireListBtn.style.display)
    
  }

  const returnToTopBtnClick = (() => {
    document.querySelector('#return-top-Btn').addEventListener('click', () => {
      console.log('to the top')
      scrollToTop()
    })
  })()

  const scrollToTop = () => {
    sideBarContainer.scrollTo(0,0)
  }
  
  //Different Ways to sort the fire list
  const sortingOptions = ({ dateSorted, wildFires }) => {
    dateSortedList = dateSorted

    let sortingAcrage = [];
    [...sortingAcrage] = wildFires.map(fire => (
      
       Object.assign (fire, {acreSorting: +fire.attributes.DailyAcres
        ? fire.attributes.DailyAcres
        : 0})
      
      ))
      
      let nameSorted = []
      nameSorted = wildFires.sort((a,b) => {
        let fireNames = a.attributes.IncidentName.localeCompare(b.attributes.IncidentName.trim());
        return fireNames
      });
      
      
      let acreSorted = []
      acreSorted = sortingAcrage.sort((a,b) => {
        let fireAcres = b.acreSorting - a.acreSorting ;
        return  fireAcres
      });

    const sorting = document.querySelectorAll('.sortClass')
    
    sorting.forEach((sortCategory) => {
      
      if(sortCategory.innerText.includes('DATE') && sortCategory.style.textDecoration){
          formatActiveFires(dateSorted)
        } else if (sortCategory.innerText.includes('NAME') && sortCategory.style.textDecoration){
            formatActiveFires(nameSorted)
            formatFirstFireItem()
        } else if (sortCategory.innerText.includes('SIZE') && sortCategory.style.textDecoration){
            formatActiveFires(acreSorted)
            formatFirstFireItem()
        }
    })

    renderFireListClickEvent({ sorting, dateSorted, nameSorted, acreSorted })

  }

  //click event to re-render list in new order
  const renderFireListClickEvent = ({ sorting, dateSorted, nameSorted, acreSorted }) => {
      
    sorting.forEach((sortCategory) => {
      sortCategory.addEventListener('click', (event) => {
        console.log(event)
        !event.target.style.textDecoration
        ? (sorting.forEach((item) => {
                                      item.style.textDecoration = '', 
                                      item.style.color=''}), 
                                      event.target.style.textDecoration = 'underline #ffb600 3px', 
                                      event.target.style.textUnderlinePosition = 'under',
                                      event.target.style.textUnderlineOffset = '2px'
          )
        : null;

        if(event.target.innerText.includes('DATE')) {
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

    document.querySelector('#fire-date').style.textDecoration = 'underline'
    document.querySelector('#fire-date').style.textUnderlinePosition = 'under'
    document.querySelector('#fire-date').style.color='#ffb600'

    formatActiveFires(dateSortedList)
  }

  const firesInView = (number) => {

    const firesInViewEl = document.getElementById('firesInView')

    const fireSpan = `<span style="font-size: 1rem; font-weight: bold; color: #FFBA1F; margin-right: 5px;"> ${number} </span> <span>FIRES IN VIEW</span>`;

    firesInViewEl.innerHTML = ""

    firesInViewEl.insertAdjacentHTML('afterbegin', fireSpan)
  }

//Functions Hub for REST calls 
//querys called from Map click
  const queryHub = ({ mapPoint, fireInformation }) => {
      mapPoint ? console.log(mapPoint) : console.log(fireInformation)

      mapPoint 
      ? fireListDisplayToggle(mapPoint)
      : fireListDisplayToggle(); 
      
      goto({ mapPoint, fireInformation });

      // removeCensusTractGraphic();
      

        renderWeatherHeader()
      //weatherWatchAndWarningsQuery({ mapPoint, fireInformation });
        
      currentDroughtQuery({ mapPoint, fireInformation });

      weatherCollection({ mapPoint, fireInformation })
        clearWeatherGrid()

        renderPeopleHeader();
      censusBlockCentroidQuery({ mapPoint, fireInformation });

      populationAgeByYear({ mapPoint, fireInformation });

      disabledPopulationQuery({ mapPoint, fireInformation });
      
      povertyPopulationQuery({ mapPoint, fireInformation });
      
        renderHousingHeader()
      housingUnitsQuery({ mapPoint, fireInformation });

      englishSpeakingAdults({ mapPoint, fireInformation });

      householdsWithVehicle({ mapPoint, fireInformation });
      
        renderHabitatHeader()
      landCoverQuery({ mapPoint, fireInformation });

      ecoregionQuery({ mapPoint, fireInformation });

      newEcoQuery({ mapPoint, fireInformation });

      criticalHabitatQuery({ mapPoint, fireInformation });

      // fireRiskQuery({ mapPoint, fireInformation });

      // wildfirePotentialGraph(wildfireTestData)
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
              'PercentContained'
            ].join(','),
            f:'json'
      }
      axios.get(url, {
        params
      })
        .then((response) => {
          console.log(response.data.features);
        const wildFires = response.data.features
      
         let fires = wildFires.map(fire => (
          { fire,
            monthDay: new Date(fire.attributes.FireDiscoveryDateTime).toLocaleString('default', {month: 'long', day: 'numeric'}),
            sortDate: fire.attributes.FireDiscoveryDateTime
            // .toLocaleString('default', {month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric'})
          }
        ));

          fires.map((fireOBJ) => {
            console.log(fireOBJ)
          })
        
      //NOTE: Currently having a problem with the entire DATE SORTED LIST. It's not sorting
        fires = fires.sort((a,b) => {
          let fireOrder = b.sortDate - a.sortDate;
          //NOTE: If we wanted to sort fires by name after sorting by time use the code below.
          // if(fireOrder === 0) fireOrder = a.fire.attributes.IncidentName.localeCompare(b.fire.attributes.IncidentName)
          // console.log(fireOrder)
          return fireOrder
        })
        // console.log(fires)

        let groupedFires = {};
        fires.forEach(fireObject => {
          if(!groupedFires[fireObject.monthDay]) {
            groupedFires[fireObject.monthDay] = []
          }

          groupedFires[fireObject.monthDay].push(fireObject)
        });

        console.log(groupedFires)

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

    const fireItemHoverHighlight = () => {
      document.querySelectorAll('.fire-item').forEach(item => {
        item.addEventListener("mouseenter", (event) => {
          console.log(`fire hover ${event.target.attributes.value.value}`)    
          
          const fireInformation = event.target.attributes.value.value.split(', ')

          fireGraphic({ fireInformation })
        }),

        item.addEventListener("mouseleave", (event) => {
          removePreviousFireIcon();
        })
      });
    };


 //query calls from clicking on a list of active fires
  const fireListItemClickEvent = async () => { 
  document.querySelectorAll(".fire-item").forEach(item => {
    item.addEventListener("click", (event) => {
      console.log(`fire clicked ${event.target.attributes.value.value}`)

       if(queryPointGraphic){
        removeMapPointGraphic();
      };

      const fireInformation = event.target.attributes.value.value.split(', ')
      
      const irwinID = fireInformation[1]; 
      
      selectedFireInfoQuery({irwinID}); //collects the selected fires information and ALSO renders it to the sidebar 

      queryHub({ fireInformation });
      
      });
    });
  }; 
   
  const selectedFireInfoQuery = ({hitTestResponse, irwinID}) => {
    
    const url = 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/USA_Wildfires_v1/FeatureServer/0/query'

    const irwinIdNumber = hitTestResponse 
          ? hitTestResponse.IrwinID || hitTestResponse.IRWINID.replace(/[{}]/g, "")
          : irwinID;

          console.log(irwinIdNumber);

    const params = {
      where: `IrwinId ='${irwinIdNumber}'`,
      time: null,
      outFields: ['IrwinID', 'IncidentName', 'ModifiedOnDateTime', 'FireDiscoveryDateTime', 'FireDiscoveryAge ', 'IncidentTypeCategory', 'DailyAcres', 'PercentContained'].join(","),
      returnGeometry: true,
      f: 'json'
    };

    axios.get(url, {
      params
    })
      .then((response) => {
        console.log(response)
        console.log(response.data.features)
        const fireIconGraphicInfo = response.data.features[0]
        const fireData = response.data.features[0]
          ? {
              irwinId: response.data.features[0].attributes.IrwinID,
              incidentName: response.data.features[0].attributes.IncidentName,
              fireDiscovery: response.data.features[0].attributes.FireDiscoveryAge === 0 ? 'Less than 24 hours' : response.data.features[0].attributes.FireDiscoveryAge,
              fireDiscoveryDateTime: response.data.features[0].attributes.FireDiscoveryDateTime,
              modifiedOnDateTime: response.data.features[0].attributes.ModifiedOnDateTime,
              incidentType: response.data.features[0].attributes.IncidentTypeCategory === "WF" ? 'WILDFIRE' : 'PERSCRIPTTION BURN',
              dailyAcres: response.data.features[0].attributes.DailyAcres === null ? 'Not reported': response.data.features[0].attributes.DailyAcres,
              percentContained: response.data.features[0].attributes.PercentContained === null ? 'Not reported' : response.data.features[0].attributes.PercentContained
            }
          : {
            irwinId: hitTestResponse.IrwinID,
            incidentName: hitTestResponse.IncidentName,
            fireDiscovery: hitTestResponse.CurrentDateAge,
            fireDiscoveryDateTime: hitTestResponse.CreateDate,
            modifiedOnDateTime: hitTestResponse.DateCurrent,
            incidentType: hitTestResponse.IncidentTypeCategory === "WF" ? 'WILDFIRE' : 'PERSCRIPTTION BURN',
            percentContained: 'Not reported'
          }
          
        setFireContentInfo({ fireData })
        populationAndEcologyPerimeterHexQuery({ irwinIdNumber })
        fireGraphic({ fireIconGraphicInfo })
      })
        .catch((error) => {
          console.log(error)
        })
  };

  const populationAndEcologyPointHexQuery = ({ irwinIdNumber }) => {
    const url ='https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/Wildfire_aggregated_v1/FeatureServer/0/query';

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
        console.log(response.data.queryGeometry)
        const hexRings = response.data.queryGeometry.rings
        //renderMapHexes(hexRings)
      })
  }

  const populationAndEcologyPerimeterHexQuery = ({ irwinIdNumber }) => {
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
        
        const firePerimeterHexData = response.data.features
        // const hexRings = response.data.queryGeometry.rings
        
        !firePerimeterHexData[0]
        ? populationAndEcologyPointHexQuery({ irwinIdNumber })
        : (console.log('yes there is perimeter data'));
        
        console.log(firePerimeterHexData)
      })
  }

  const currentDroughtQuery = ({mapPoint, fireInformation}) => {
    
    fireInformation ? console.log(fireInformation) : console.log(mapPoint)
    
    const url = 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/US_Drought_Intensity_v1/FeatureServer/3/query'

    const params = {
     where: '1=1',
      geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
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
              return 'Moderate drought'
          } else if (droughtCondition === 2) {
              return 'Severe drought'
          } else if (droughtCondition === 3) {
              return 'Extreme drought'
          } else if (droughtCondition === 4) {
              return ' Exceptional drought'
          } else if (droughtCondition === 'Drought conditions not reported') {
            return 'Not reported'
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
        geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
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
      geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
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
        
        const windTime = response.data.features[0] 
                        ?response.data.features.sort((a, b) => {
          return a.attributes.fromdate - b.attributes.fromdate})
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
        geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
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
        geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
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

  const populationAgeByYear = ({ mapPoint, fireInformation }) => {

    const url = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_Total_Population_Boundaries/FeatureServer/2/query'

    const params = {
      where: '1=1',
      geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
      geometryType: 'esriGeometryPoint',      
      inSR: 4326,
      outFields: ['B01001_001E', 'B01001_003E', 'B01001_004E', 'B01001_027E', 'B01001_028E', 'B01001_005E', 'B01001_006E', 'B01001_029E', 'B01001_030E', 'B01001_049E', 'B01001_048E', 'B01001_025E', 'B01001_024E', 'B01001_calc_pctLT18E', 'B01001_calc_numLT18E', 'B01001_calc_numGE65E', 'B01001_calc_numGE65E'].join(','),
      returnGeometry: true,
      returnQueryGeometry: true,
      f: 'json'
    }

    axios.get(url, {
      params
    })
    .then((response) => {

      const underFourteenPop = response.data.features[0] 
      ? response.data.features[0].attributes.B01001_003E + response.data.features[0].attributes.B01001_004E + response.data.features[0].attributes.B01001_005E + response.data.features[0].attributes.B01001_027E + response.data.features[0].attributes.B01001_028E + response.data.features[0].attributes.B01001_029E
      : 'No information available';

      const fifteenToSeventeenPop = response.data.features[0]
      ? response.data.features[0].attributes.B01001_006E + response.data.features[0].attributes.B01001_030E
      : 'No information available';

      const eightteenToSixtyfourPop = response.data.features[0] 
      ? response.data.features[0].attributes.B01001_001E -  response.data.features[0].attributes.B01001_calc_numLT18E - response.data.features[0].attributes.B01001_calc_numGE65E
      : 'No information available';

      const eightyPop = response.data.features[0]
      ? response.data.features[0].attributes.B01001_024E + response.data.features[0].attributes.B01001_025E + response.data.features[0].attributes.B01001_048E + response.data.features[0].attributes.B01001_049E
      : 'No information available';

      const sixtyfiveToSeventynine = response.data.features[0]
      ? response.data.features[0].attributes.B01001_calc_numGE65E - eightyPop
      : 'No information available';

      const censusTract = response.data.features[0]
      ? response.data.features[0].geometry
      : 'geometry unavailable'; 

      const totalPopulation = response.data.features[0] 
      ? response.data.features[0].attributes.B01001_001E
      : 'No information available';

      const populationData = response.data.features[0] 
      ? [{'data': underFourteenPop, name: '< 14'}, {'data': fifteenToSeventeenPop, name: '15-17'}, {'data': eightteenToSixtyfourPop, name: '18-64'},{'data': sixtyfiveToSeventynine, 'name': '65-79'},{'data': eightyPop, 'name': '+ 80'}]
      : null;

      console.log(response);
      console.log(`total Population: ${totalPopulation}`)
      console.log(`Under 10 Population: ${underFourteenPop}`)
      console.log(`10-17: ${fifteenToSeventeenPop}`)
      console.log(`18-64: ${eightteenToSixtyfourPop}`)
      console.log(`65-79: ${sixtyfiveToSeventynine}`)
      console.log(`80+: ${eightyPop}`)


      //renderCensusTract(censusTract)
      populationBarGraph({ populationData })
      totalPopulationUIRender({ totalPopulation })
    })
    .catch((error) => {
      console.error(error)
    })
  };

  const disabledPopulationQuery = ({ mapPoint, fireInformation }) => {

  const url = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_Disability_by_Type_Boundaries/FeatureServer/2/query';

  const params = {
     where: '1=1',
       geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
      geometryType: 'esriGeometryPoint',      
      inSR: 4326,
      outFields: 'C18108_calc_pctDE',
      returnQueryGeometry: true,
      f: 'json'
    }

    axios.get(url, {
      params
    })
      .then((response) => {
        const disabledPopulation = response.data.features[0]
        ? `${response.data.features[0].attributes.C18108_calc_pctDE}`
        : null; 
        console.log('disabled population:')
        console.log(disabledPopulation);
        disabledPopulationRender(disabledPopulation);
      })
      .catch((error) => {
        console.error(error);
      })
  }

  const povertyPopulationQuery = ({ mapPoint, fireInformation }) => {

    const url = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_Poverty_by_Age_Boundaries/FeatureServer/2/query';

    const params = {
      where: '1=1',
       geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
      geometryType: 'esriGeometryPoint',      
      inSR: 4326,
      outFields: 'B17020_calc_pctPovE',
      f:'json'
    }

    axios.get(url, {
      params
    })
      .then((response) => {
        const povertyPopulation = response.data.features[0]
        ? `${response.data.features[0].attributes.B17020_calc_pctPovE}`
        : null;
        console.log('poverty population')
        console.log(povertyPopulation)

        povertyPopulationRender(povertyPopulation)
      })

  }

  const housingUnitsQuery = ({ mapPoint, fireInformation }) => {

    const url = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_Housing_Occupancy_and_Tenure_Unit_Value_Boundaries/FeatureServer/2/query'

    const params = {
      where: '1=1',
       geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
      geometryType: 'esriGeometryPoint',      
      inSR: 4326,
      outFields: ['B25002_001E', 'B25077_001E'].join(','),
      f: 'json'
    }

    axios.get(url, {
      params
    })
      .then((response) => {
        console.log('housing units');
        
        const housingData = {
          housingUnits: response.data.features[0].attributes.B25002_001E,
          housingValue: response.data.features[0].attributes.B25077_001E
                        ? `$${response.data.features[0].attributes.B25077_001E.toLocaleString()}`
                        : 'No information available'
        }
        
        console.log(`Total Houses ${housingData.housingUnits}`)
        console.log(`Median Home Values $${housingData.housingValue}`)

        housingInfoRender({ housingData })
      })
  }

  const englishSpeakingAdults = ({ mapPoint, fireInformation }) => {

    const url = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_English_Ability_and_Lingusitic_Isolation_Households_Boundaries/FeatureServer/2/query'

    const params = {
      where: '1=1',
       geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
      geometryType: 'esriGeometryPoint',      
      inSR: 4326,
      outFields: '100 - B16004_calc_pctGE18LEAE',
      f: 'json'
    }

    axios.get(url, {
      params
    })
      .then((response) => {
        const englishSpeakingPopulation = {value: response.data.features[0].attributes.FIELD_EXP_0}
        console.log(`English speaking Adults: ${englishSpeakingPopulation.value}%`)
        englishSpeakingPopulation.value
        ? englishBarGraph({ englishSpeakingPopulation })
        : null
      })
  }

  const householdsWithSmartphones = ({ mapPoint, fireInformation }) => {

    const url = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_Highlights_Emergency_Response_Boundaries/FeatureServer/2/query'

    const params = {
      where: '1=1',
       geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
      geometryType: 'esriGeometryPoint',      
      inSR: 4326,
      outFields: '100 - B28001_calc_pctNoSPE',
      f: 'json'
    }

    axios.get(url, {
      params
    })
      .then((response) => {
        const concentrationOfSmartphones = response.data.features[0].attributes.FIELD_EXP_0
        console.log(`Households with smartphones: ${response.data.features[0].attributes.FIELD_EXP_0}%`)
        smartphonePercentageBar({ concentrationOfSmartphones })
      })
  }

  const householdsWithInternet = ({ mapPoint, fireInformation }) => {

    const url = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_Internet_Connectivity_Boundaries/FeatureServer/2/query'

    const params = {
      where: '1=1',
       geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
      geometryType: 'esriGeometryPoint',      
      inSR: 4326,
      outFields: '100 - B28002_calc_pctNoIntE',
      f: 'json'
    }

    axios.get(url, {
      params
    })
      .then((response) => {
        const concentrationOfInternet = response.data.features[0].attributes.FIELD_EXP_0;
        console.log(`Households with internet: ${response.data.features[0].attributes.FIELD_EXP_0}%`);
        internetPercentageBar({ concentrationOfInternet })
      })
  }

  const householdsWithVehicle = ({ mapPoint, fireInformation }) => {

    const url = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/ACS_Vehicle_Availability_Boundaries/FeatureServer/2/query';

    const params = {
      where: '1=1',
       geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
      geometryType: 'esriGeometryPoint',      
      inSR: 4326,
      outFields: '100 - B08201_calc_pctNoVehE',
      f: 'json'
    }

    axios.get(url, {
      params
    })
      .then((response) => {
        const concentrationOfVehicles = response.data.features[0].attributes.FIELD_EXP_0
        console.log(`Households with a vehicle: ${response.data.features[0].attributes.FIELD_EXP_0}%`)
        concentrationOfVehicles
        ? vehiclePercentageBar({ concentrationOfVehicles })
        : null
      })
  }

  const landCoverQuery = ({ mapPoint, fireInformation }) => {
    console.log('landCover Called')
    
    const url = 'https://services.arcgis.com/jIL9msH9OI208GCb/ArcGIS/rest/services/Nlcd_Simplified_By_Census_Tract_220412a/FeatureServer/0/query'

    const params = {
      where: '1=1',
      geometry: fireInformation ? `${fireInformation[0]}` : mapPoint,
      geometryType: 'esriGeometryPoint',
      inSR: 4326,
      outFields: ['PctWater', 'PctSnowIce', 'PctDeveloped', 'PctBarren', 'PctForest', 'PctShrubScrub', 'PctGrassHerb', 'PctCropPasture', 'PctWetlands'].join(','),
      f:'json',
    }

    axios.get(url, {
      params
    })
      .then((response) => {
        console.log(response)
        const landCoverPercentage = response.data.features[0].attributes
        console.log('Land Cover')
        console.log(landCoverPercentage)
        landCoverDataFormatting({ landCoverPercentage })
      })
  }

  const ecoregionQuery = ({ mapPoint, fireInformation }) => {

    const url = 'https://services2.arcgis.com/FiaPA4ga0iQKduv3/ArcGIS/rest/services/EPA_Level_III_Ecoregions/FeatureServer/0/query'

    const params = {
      where: '1=1',
       geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
      geometryType: 'esriGeometryPoint',      
      inSR: 4326,
      outFields: 'NA_L3NAME',
      f: 'json'
    }

    axios.get(url, {
      params
    })
      .then((response) => {
        console.log(`Ecoregion: ${response.data.features[0].attributes.NA_L3NAME}`)
      })
  }

  const criticalHabitatQuery = ({ mapPoint, fireInformation }) => {

    const url = 'https://services.arcgis.com/jIL9msH9OI208GCb/ArcGIS/rest/services/Environmental_Information_by_Tract/FeatureServer/0/query?'

    const params = {
      where: '1=1',
      geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
      geometryType: 'esriGeometryPoint',      
      inSR: 4326,
      outFields: '*',
      f: 'json'
    }

    axios.get(url, {
      params
    })
      .then((response) => {
        
        const uneditedProtectedLandsList = response.data.features[0].attributes.OwnersPadus.split(', ');

          uneditedProtectedLandsList[0] === uneditedProtectedLandsList[1]
          ? uneditedProtectedLandsList.shift()
          : null;


        const habitatDetails = {
          bioDiversity: response.data.features[0].attributes.RichClass,
          ecoregion: response.data.features[0].attributes.L3EcoReg
                   ? response.data.features[0].attributes.L3EcoReg
                   : 'No information available',
          landformType: response.data.features[0].attributes.LandForm
                      ? response.data.features[0].attributes.LandForm
                      : 'No information available',
          criticalHabitat: response.data.features[0].attributes.CritHab
                         ? response.data.features[0].attributes.CritHab
                         : 'None present',
          protectedAreas: uneditedProtectedLandsList 
                          ? uneditedProtectedLandsList.join(', ')
                          : 'No information available',
          tractRanking: response.data.features[0].attributes.RichRank,
          totalTracts: response.data.features[0].attributes.TotalTracts,
          state: response.data.features[0].attributes.State.toUpperCase()
        }
        console.log(habitatDetails)
        habitatInfoRender({ habitatDetails })
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const fireRiskQuery = ({ mapPoint, fireInformation }) => {
    fireInformation ? console.log(fireInformation) : console.log(mapPoint)

    const url = 'https://services.arcgis.com/XG15cJAlne2vxtgt/ArcGIS/rest/services/National_Risk_Index_Census_Tracts/FeatureServer/0/query'

    const params = {
      where: '1=1',
      geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
      geometryType: 'esriGeometryPoint',      
      inSR: 4326,
      outFields: ['STATE','WFIR_RISKR'].join(','),
      f: 'json'
    }

    axios.get(url, {
      params
    })
      .then((response) => {
        console.log(response.data.features[0])
        const fireRiskRating = response.data.features[0].attributes.WFIR_RISKR
        console.log(fireRiskRating)
        renderRisk(fireRiskRating)
      })
  }

//NEW ECO QUERY
  const newEcoQuery = ({ mapPoint, fireInformation }) => {

    const url = 'https://services.arcgis.com/jIL9msH9OI208GCb/ArcGIS/rest/services/ConusHexesFirstBatch220623output/FeatureServer/0/query'

    const params = {
      where: '1=1',
      geometry: fireInformation ? `${fireInformation[0]}` : `${mapPoint.longitude}, ${mapPoint.latitude}`,
      geometryType: 'esriGeometryPoint',
      inSR: 4326,
      spatialRelationship: 'intersects',
      distance: 2,
      units: 'esriSRUnit_StatuteMile',
      outFields: ['L3EcoReg', 'LandForm', 'CritHab', 'OwnersPadus', 'RichClass', 'WHPClass', 'PctWater', 'PctSnowIce', 'PctDevelop', 'PctBarren', 'PctForest', 'PctShrub', 'PctGrass', 'PctCropland', 'PctWetlands'].join(','),
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
        
        if(!response.data.features){
          return
        }
        
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
        
        aggragateEcoObj.CritHab
        ?  aggragateEcoObj.CritHab = aggragateEcoObj.CritHab.split(', ').filter(entry => !entry.includes(undefined) && !entry.includes("")).reduce((CritHabObj, CritHabItem) => {
            !CritHabObj[CritHabItem] 
            ? CritHabObj[CritHabItem] = 1 
            : CritHabObj[CritHabItem]++
            return CritHabObj
            },{})
        : null;
        
        aggragateEcoObj.L3EcoReg
        ? aggragateEcoObj.L3EcoReg = aggragateEcoObj.L3EcoReg.split(', ').filter(entry => !entry.includes(undefined)).reduce((L3EcoRegObj, L3EcoRegItem) => {
            !L3EcoRegObj[L3EcoRegItem] 
            ? L3EcoRegObj[L3EcoRegItem] = 1 
            : L3EcoRegObj[L3EcoRegItem]++
            return L3EcoRegObj
          },{})
        : null;

        aggragateEcoObj.LandForm
        ? aggragateEcoObj.LandForm = aggragateEcoObj.LandForm.split(', ').filter(entry => !entry.includes(undefined)).reduce((landformObj, landformItem) => {
            !landformObj[landformItem] 
            ? landformObj[landformItem] = 1 
            : landformObj[landformItem]++
            return landformObj
            },{})
        : null;

        aggragateEcoObj.OwnersPadus
        ? aggragateEcoObj.OwnersPadus = aggragateEcoObj.OwnersPadus.split(', ').filter(entry => !entry.includes(undefined)).reduce((OwnersPadusObj, OwnersPadusItem) => {
            !OwnersPadusObj[OwnersPadusItem] 
            ? OwnersPadusObj[OwnersPadusItem] = 1 
            : OwnersPadusObj[OwnersPadusItem]++
            return OwnersPadusObj
          },{})
        : null;
        
        aggragateEcoObj.RichClass
        ? aggragateEcoObj.RichClass = aggragateEcoObj.RichClass.split(', ').filter(entry => !entry.includes(undefined)).reduce((RichClassObj, RichClassItem) => {
            !RichClassObj[RichClassItem] 
            ? RichClassObj[RichClassItem] = 1 
            : RichClassObj[RichClassItem]++
            return RichClassObj
          },{})
        : null;
        
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
        
        if(aggragateEcoObj.WHPClass){
        aggragateEcoObj.WHPClass["Very High"] = aggragateEcoObj.WHPClass["Very High"]/ecoResponse.length;
        aggragateEcoObj.WHPClass["High"] = aggragateEcoObj.WHPClass["High"] / ecoResponse.length;
        aggragateEcoObj.WHPClass["Moderate"] = aggragateEcoObj.WHPClass["Moderate"] / ecoResponse.length;
        aggragateEcoObj.WHPClass["Low"] = aggragateEcoObj.WHPClass["Low"] / ecoResponse.length;
        aggragateEcoObj.WHPClass["Very Low"] = aggragateEcoObj.WHPClass["Very Low"] / ecoResponse.length;
        }
        console.log(ecoResponse)
        console.log(aggragateEcoObj)
        
        const allHexRings = {rings: []};
        const hexPerimeter = response.data.features.map((eachHexGeography) => {    
          allHexRings.rings.push(eachHexGeography.geometry.rings[0]);
        
        });
        
        console.log(allHexRings)
        console.log(response.data.queryGeometry)
        formatWildfireRiskData({aggragateEcoObj}) 
        // renderMapHexes(allHexRings);
        renderMapHexes(response.data.queryGeometry)
      })
  };

//DATA VIZ

//Landcover piechart
const landCoverDataFormatting = ({ landCoverPercentage }) => {
                                                                                 
  const forestPercent = {'name': 'Forest', 'percent':landCoverPercentage.PctForest, 'fill':'#005948'}
  const barrenPercent = {'name': 'Barren', 'percent':landCoverPercentage.PctBarren, 'fill': '#6E726B'}
  const CroplandPercent = {'name': 'Cropland', 'percent':landCoverPercentage.PctCropPasture, 'fill': '#D3AA5F'}
  const DevelopedPercent = {'name': 'Developed', 'percent':landCoverPercentage.PctDeveloped, 'fill': '#993131'}
  const GrasslandPercent = {'name': 'Grassland', 'percent':landCoverPercentage.PctGrassHerb, 'fill': '#918652'}
  const shrubScrubPercent = {'name': 'Scrubland', 'percent':landCoverPercentage.PctShrubScrub, 'fill': '#4F482A' }
  const snowIcePercent = {'name': 'Snow / Ice', 'percent':landCoverPercentage.PctSnowIce, 'fill': '#EDEDEB'}
  const waterPercent = {'name': 'Water', 'percent':landCoverPercentage.PctWater, 'fill': '#054F8C'}
  const wetlandsPercent = {'name': 'Wetlands', 'percent':landCoverPercentage.PctWetlands, 'fill': '#028B9C'}
  
  const landCoverArray = [
                          forestPercent, 
                          barrenPercent, 
                          CroplandPercent, 
                          DevelopedPercent, 
                          GrasslandPercent, 
                          shrubScrubPercent, 
                          snowIcePercent, 
                          wetlandsPercent, 
                          waterPercent, 
                        ]

  let placeholderPercent = 0
                      
  landCoverArray.map(value => {
  
    value.percent = parseFloat(parseFloat(value.percent).toFixed(0))
    
    if (value.percent < 10) {
      
      placeholderPercent += value.percent;
      
      value.percent = 0;  
    }    

  });

   const otherPercent = { 'name': 'Other', 'percent' : parseFloat(placeholderPercent.toFixed(0)), 'fill': '#D9C7AE' }
   landCoverArray.push(otherPercent)

  renderLandCoverGraph(landCoverArray);

}

const renderLandCoverGraph = (landCoverArray) => {

  d3.select('#landcover-graph')  
  .remove();
  
  document.querySelector('#landcover-data-control').innerText = ``

  const landCoverArrayData = landCoverArray;
  landCoverArrayData.filter(entry => !(entry.percent === 0));
  console.log(landCoverArrayData);
  
  if(!landCoverArrayData){
    const noLandCoverData = document.createElement('h4');
    
    noLandCoverData.setAttribute("class", "bold");
    noLandCoverData.innerHTML = 'No data available';
    
    document.querySelector('#landcover-data-control').append(noLandCoverData)
    return
  }


  const colorScheme = d3.scaleOrdinal()
                          .domain(landCoverArrayData)
                          .range(['#005948', '#6E726B', '#D3AA5F', '#993131', '#918652', '#4F482A', '#EDEDEB', '#028B9C', '#054F8C', '#D9C7AE']);
  
  const svg = d3.select('#landcover-chart')
    .append('div')
      .attr('id', 'landcover-graph')
    .append('svg')
      .attr('height', 200)
      .attr('width',  360)
      .attr('id', 'landcover-svg');

  svg;

  const landcoverSVG = d3.select('#landcover-svg'),
        width = landcoverSVG.attr("width"),
        height = landcoverSVG.attr("height"),
        radius = Math.min(width, height) / 2;

  const g = landcoverSVG.append('g')
                        .attr('transform', `translate(${width / 2}, ${height / 2})`);

  const bgColor = landcoverSVG.append('g')
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
                        .range(['#ffffff', '#021a26;',])

    const barSVG = d3.select('#containment').append('svg')
      .attr('class', 'bar')
      .attr('id','containment-bar')
      .style('margin', '6px 5px 0')
      .attr('width', 380)
      .attr('height', 55)
      .attr("x", 20);

    const statusBar = d3.scaleLinear()
      .domain([0, d3.max(data)])
      .range([0, 190]);

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
      .attr("x", containment*1.9)
      .attr('text-anchor', 'end')
      .attr('fill', '#ffb600')
      .style('font-size', '1.414rem')
      .style('font-weight', 'bold')
    .text(`${containment}%`)
     
    }
  }

  //Population Bar Chart
  const populationBarGraph = ({ populationData }) => {
    console.log(populationData)

    const populationDataValue = populationData.reduce(
      (a,b) => a + b.data, 0
      
    )

    const width = 260;
    const height = 120;
    const margin = {
      top: 15,
      right: 10,
      left: 20,
      bottom: 20
    };

    //clear out the existing chart
     d3.select('#population-graph')  
      .remove();
    
    if(populationDataValue === 0) {
      // noPopulationValue();
      console.log('no people data')
      document.querySelector('#people-data-control').innerText = 'No available population data'
      return
    };

    document.querySelector('#people-data-control').innerText = ''

    d3.select('#people-container')
    .append('div',"div")
      .attr('id', 'population-graph')
      .style('width', `${width}px`)
    .append('svg')
      .attr('id', 'population-svg');

    //set up the svg container
    
    const svg = d3.select('#population-svg')
      .attr('height', height)
      .attr('width', width)
      .style('overflow', 'visible')
      .style('margin-top', '1.1865em')
      .style('margin-bottom', margin.bottom);

    const g = svg.append('g');
    
    //set up the Scales
    const xScale = d3.scaleBand()
      .domain(populationData.map((d, i) => d.name))
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(populationData, d => d.data)])
      .range([height, 0]);
    
    //set up the axes
    const xAxis = d3.axisBottom(xScale)
    const yAxis = d3.axisLeft(yScale)

    g.call(xAxis)
      .attr('transform', `translate(0, ${height})`);
    
    //set up the svg data
    svg.selectAll('.bar')
      .data(populationData)
      .enter().append('rect')
        .attr('class','rect-bar')
        .attr('x', (d, i) => xScale(d.name, i))
        .attr('y', d => yScale(d.data))
        .attr('width', xScale.bandwidth())
        .attr('height', d => height - yScale(d.data))
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
          .style('font-weight', '600')
        .text(d.data.toLocaleString())
      })
      .on('mouseout', () => {
        svg.select('.pop').remove()
      })
      
      const populationGraphLabel = document.createElement('p')
      populationGraphLabel.setAttribute('style', 'text-align: center; font-size: 0.875rem;')
      populationGraphLabel.append('AGE IN YEARS')

    document.querySelector('#population-graph').append(populationGraphLabel)

  }

  //english speaking population
  const englishBarGraph = ({ englishSpeakingPopulation }) => {
  console.log('bargraph Called')
  console.log(englishSpeakingPopulation)

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
    .append('svg')
      .attr('id', 'english-speaking-svg');

      //different code pasting in here.

  const data = [100.01, englishSpeakingPopulation.value]
  console.log(data)
  const barColors = d3.scaleOrdinal()
                        .domain(data)
                        .range(['#032235', '#07698C',])

    const barSVG = d3.select('#english-speaking-svg')
      .attr('class', 'bar')
      .attr('width', width)
      .attr('height', height)
      .attr("x", 20);

  const g = barSVG.append('g')
          .attr('transform', `translate(${width / 2}, ${height / 2})`);


    const percentBar = d3.scaleLinear()
      .domain([0, d3.max(data)])
      .range([0, range]);

    barSVG.selectAll('rect')
      .data(data)
      .enter().append('rect')
        .attr('width', percentBar)
        .attr('height', 30)
        .attr('fill', d => barColors(d));

    barSVG.append("text")
      .attr("dy", "1.4em")
      .attr("dx", "1.5em")
      .attr("x", (range/2))
      .attr('text-anchor', 'end')
      .style('fill', 'white')
      .style('font-weight', 'bold')
    .text(`${data[1]}%`);
    

    g.insert('text')
      .attr('id','english-pop-header')
      .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      .text('SPEAKS ENGLISH')
      .attr('fill', '#efefef');
  }

  const smartphonePercentageBar = ({ concentrationOfSmartphones }) => {
    console.log(concentrationOfSmartphones)

    d3.select('#smartphone-percent-bar')
    .remove();
    
    d3.select('#smartphone-pop-header')
    .remove();

  const range = 300;
  const height = 150;
  
  const margin = {
    top: 0,
    right: 10,
    left: 10,
    bottom: 10
  };
  
  d3.select('#smartphone-pop-percentage')
    .insert('text')
      .attr('id','smartphone-pop-header')
      .text('HAS SMARTPHONE')
    .insert('div',"div")
      .attr('id', 'smartphone-percent-bar')
    .append('svg')
      .attr('id', 'smartphone-svg');


  const data = [100, concentrationOfSmartphones ]

  const barColors = d3.scaleOrdinal()
                        .domain(data)
                        .range(['#F1E3E4', '#CCBCBC',])

    const barSVG = d3.select('#smartphone-svg')
      .attr('class', 'bar')
      .attr('width', `100%`)
      .attr('height', 40)
      .attr("x", 20);

    const percentBar = d3.scaleLinear()
      .domain([0, d3.max(data)])
      .range([0, range]);

    barSVG.selectAll('rect')
      .data(data)
      .enter().append('rect')
        .attr('width', percentBar)
        .attr('height', 20)
        .attr('fill', d => barColors(d));

    barSVG.append("text")
      .attr("dy", "1em")
      .attr("dx", "1.5em")
      .attr("x", (range/2))
      .attr('text-anchor', 'end')
      .style('fill', data[1] < 50 ? 'black' : 'white')
    .text(`${data[1]}%`)


  }

  const internetPercentageBar = ({ concentrationOfInternet }) => {
    console.log(concentrationOfInternet)

    d3.select('#internet-percent-bar')
    .remove();
    
    d3.select('#internet-pop-header')
    .remove();

    

  const range = 300;
  const height = 150;
  
  const margin = {
    top: 0,
    right: 10,
    left: 10,
    bottom: 10
  };
  
  d3.select('#internet-pop-percentage')
    .insert('text')
      .attr('id','internet-pop-header')
      .text('HAS INTERNET')
    .insert('div',"div")
      .attr('id', 'internet-percent-bar')
    .append('svg')
      .attr('id', 'internet-svg');


  const data = [100, concentrationOfInternet ]

  const barColors = d3.scaleOrdinal()
                        .domain(data)
                        .range(['#F1E3E4', '#CCBCBC',])

    const barSVG = d3.select('#internet-svg')
      .attr('class', 'bar')
      .attr('width', `100%`)
      .attr('height', 40)
      .attr("x", 20);

    const percentBar = d3.scaleLinear()
      .domain([0, d3.max(data)])
      .range([0, range]);

    barSVG.selectAll('rect')
      .data(data)
      .enter().append('rect')
        .attr('width', percentBar)
        .attr('height', 20)
        .attr('fill', d => barColors(d));

    barSVG.append("text")
      .attr("dy", "1em")
      .attr("dx", "1.5em")
      .attr("x", (range/2))
      .attr('text-anchor', 'end')
      .style('fill', data[1] < 50 ? 'black' : 'white')
    .text(`${data[1]}%`)


  }

  const vehiclePercentageBar = ({ concentrationOfVehicles }) => {
    console.log(concentrationOfVehicles)

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
    .append('svg')
      .attr('id', 'vehicle-svg');


  const data = [100.01, concentrationOfVehicles ]

  const barColors = d3.scaleOrdinal()
                        .domain(data)
                        .range(['#032235', '#07698C',])

    const barSVG = d3.select('#vehicle-svg')
      .attr('class', 'bar')
      .attr('width', `100%`)
      .attr('height', height)
      .attr('width', width)
      .attr("x", 20);
      
    const g = barSVG.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const percentBar = d3.scaleLinear()
      .domain([0, d3.max(data)])
      .range([0, range]);

    barSVG.selectAll('rect')
      .data(data)
      .enter().append('rect')
        .attr('width', percentBar)
        .attr('height', 30)
        .attr('fill', d => barColors(d));


    barSVG.append("text")
      .attr("dy", "1.4em")
      .attr("dx", "1.5em")
      .attr("x", (range/2))
      .attr('text-anchor', 'end')
      .style('fill', 'white')
      .style('font-weight', 'bold')
    .text(`${data[1]}%`);

    g.insert('text')
      .attr('id','vehicle-pop-header')
      .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      .text('HAS VEHICLE')
      .attr('fill', '#efefef');

  }

//WILDFIRE HAZARD POTENTIAL BAR GRAPH
    
  const formatWildfireRiskData = ({aggragateEcoObj}) => {
    
    
    const wildfireRiskData = [
      {name:"VERY HIGH", value: 0},
      {name: "HIGH", value: 0},
      {name: "MODERATE", value: 0},
      {name: "LOW", value: 0},
      {name: "VERY LOW", value: 0}
  ];

  console.log(aggragateEcoObj.WHPClass)
    if (aggragateEcoObj.WHPClass){
    wildfireRiskData[0].value = aggragateEcoObj.WHPClass["Very High"] || 0;
    wildfireRiskData[1].value = aggragateEcoObj.WHPClass["High"] || 0;
    wildfireRiskData[2].value = aggragateEcoObj.WHPClass["Moderate"] || 0;
    wildfireRiskData[3].value = aggragateEcoObj.WHPClass["Low"] || 0;
    wildfireRiskData[4].value = aggragateEcoObj.WHPClass["Very Low"] || 0;
    }

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

  
      const width = 290;
      const height = 170;
      const margin = {
        top: 15,
        right: 25,
        left: 45,
        bottom: 10
      };

      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      d3.select('#wildfire-risk')
	    .append('div',"div")
        .attr('id', 'wildfire-risk-graph')
        .style('width', `$${width+margin.right}px`)
        .style('margin-left', `${margin.left}px`)
      .append('svg')
        .attr('id', 'wildfire-risk-graph-svg');

  const barColors = d3.scaleOrdinal()
                        .domain(data)
                        .range(['#993131', '#B6673E','#D3AA5F', '#C1B999', '#707767']);

      //set up the svg container
      const svg = d3.select('#wildfire-risk-graph-svg')
        .attr('height', height)
        .attr('width', width)
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
          .attr('width', d => (d.value > 0 ? (d.value*210) : (0.02*210)))
          .attr('height', "20px")
          .attr('fill', d => barColors(d.name));
        
      svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('text')
        .attr('transform', `translate(${margin.left + 10}, 38)`)
            .attr('class', 'riskPercent')
            .attr('x', (d) => (d.value)*210)
            .attr('y', (d, i) => yScale(d.name, i))
            .attr('fill', '#a5927c')
            .style('font-weight', '600')
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

  const renderPeopleHeader = async () => {
    const poepleContentHeader = infoItemHeader[2].innerHTML = `<p class = "trailer-0 sectionHeader">POPULATION</p>
                                                               <p class = "trailer-0 sectionSubHeader">CENSUS BLOCK</p>`;

    poepleContentHeader
  };
  
  //NOTE: I don't have the HTML set up for this. Maybe just add all the needed markup in the HTML file?
  const renderHousingHeader = async () => {
  const poepleContentHeader = infoItemHeader[3].innerHTML = `<p class = "trailer-0 sectionHeader">HOUSING</p>
                                                              <p class = "trailer-0 sectionSubHeader">CENSUS BLOCK</p>`;

  poepleContentHeader
  };

  const renderHabitatHeader = () => {

    const habitatContentHeader = infoItemHeader[4].innerHTML = `<p class = "trailer-0 sectionHeader">ECOSYSTEM</p>
                                                                <p class = "trailer-0 sectionSubHeader">HIGHLIGHTED SUMMARY</p>`;

    habitatContentHeader
  };

  const renderWatchesAndWarningsContent = async ({ warnings }) => {

    console.log('render weather')
    console.log(warnings)
    
    const watchesAndWarningsInfo = `
        <div style = "display: flex;">
          <div style = "">
            <p style = "width: max-content; margin: 15px 10px 0px 0px;">WATCHES & WARNINGS</p>
          </div>
          <div style = "min-height: 1.5rem; background-color:#011D32;">
            <ptrailer-0" style = "margin: 0.5rem; color: #efefef;"> 
            ${warnings.existingWarning}
            </p>
          </div>
        </div>`;
        
    // await renderWeatherHeader()
    
    const watchesAndWarningsDivEl = document.getElementById('watches-and-warnings').innerHTML = watchesAndWarningsInfo;  
    
    watchesAndWarningsDivEl
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
                          <span class = "unit-conversion" style = "margin: 0 8px 0 0; text-decoration: underline #FFBA1F 3px; text-underline-position: under; text-underline-offset: 2px; cursor: default; cursor: pointer;">&degF MPH
                          </span>
                          <span class = "unit-conversion" style = "cursor: pointer; ">&degC KM/H
                          </span>
                        </div>
                        <div class="item-2" style = "margin: 15px 0 10px 0; text-align: center;">
                          <span>TODAY</span>
                        </div>
                        <div class="item-3" style = "margin: 15px 0 10px 0; text-align: center;">
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

    changeWeatherMetrics({ temp, wind, airQualityToday, airQualityTomorrow })
  }

  const changeWeatherMetrics = ({ temp, wind, airQualityToday, airQualityTomorrow }) => {
      
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
    const aqToday = airQualityToday
    const aqTomorrow = airQualityTomorrow

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
 
  
  const totalPopulationUIRender = async ({ totalPopulation }) => {
    if (totalPopulation === 0) {
      return 
    };

    document.querySelector('#general-population').innerHTML = 
    `
      <div style = "margin-bottom: 10px;">
      <h4 class= "bold">${ totalPopulation.toLocaleString()}</h4>
      <p style = "margin: -5px auto -5px"> POPULATION </p>
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

  const housingInfoRender = ({ housingData }) => {

    document.querySelector('#housing-container-stats').innerHTML = `
      <div style = "margin-bottom: 10px">
      <h4 class= "bold">${housingData.housingUnits.toLocaleString()}</h4>
        <p style = "margin-bottom: -5px;">TOTAL HOUSING UNITS </p> 
      </div>
      <div>
      <h4 class = "bold" style = "line-height: 1.2;">${housingData.housingValue.toLocaleString()}</h4>
        <p style = "margin-bottom: -5px;"> MEDIAN HOUSING VALUE </p>
      </div>
    `
  }

  const habitatInfoRender = ({ habitatDetails }) => {
    console.log(habitatDetails);
    document.querySelector('#habitat-information').innerHTML = `
      
      `;
    
      document.querySelector('#ecoregion').innerHTML = `
     <div>
        <p class = "trailer-0">ECOREGION</p>
        <div style = "margin-bottom: 15px;">
          <h4 class = "bold" style = "margin-top: -7px; ">${habitatDetails.ecoregion}</h4>
        </div>
      </div>`;

      document.querySelector('#landform').innerHTML = `
      <div>
          <p class = "trailer-0">LANDFORM TYPE</p>
          <div style = "margin-bottom: 15px;">
            <h4 class = "bold" style = "margin-top: -7px;">${habitatDetails.landformType}</h4>
          </div>
        </div>`;

      document.querySelector('#biodiversity').innerHTML = `
    <div style = "margin-bottom: 1.5625rem;">
        <div style = "width: 100%;">
          <div>
          <p class = "trailer-0">BIODIVERSITY</p>
        </div>
        <div style ="width: 100%; display: flex">
          <div style = "width: 50%; text-align: center; align-self: center;">
          <h4 class = "bold">${habitatDetails.bioDiversity}</h4>
              <p style ="margin-bottom: 5px; margin-top: 5px;">Imperiled Species Biodiversity</p>
          </div>
          <div style = "width: 50%;"> 
            <img src="https://www.arcgis.com/sharing/rest/content/items/668bf6e91edd49d1bb8b3f00d677b315/data"
              style="width:70px; height:70px;
              margin-right: 10px; 
              display: inline-flex;" 
              viewbox="0 0 32 32" 
              class="svg-icon" 
              type="image/svg+xml">
            <img src="https://www.arcgis.com/sharing/rest/content/items/bc5dc73ad7d345de840c128cc42cc938/data"
              style="width:70px; height:70px; 
              display: inline-flex;" 
              viewbox="0 0 32 32" 
              class="svg-icon" 
              type="image/svg+xml">
            <img src="https://www.arcgis.com/sharing/rest/content/items/96a4af6a248b4da48f1b7bd703f88485/data"
              style="width:70px; height:70px;
              margin-right: 7px;
              display: inline-flex;" 
              viewbox="0 0 32 32" 
              class="svg-icon" 
              type="image/svg+xml">
            <img src="https://www.arcgis.com/sharing/rest/content/items/3c9e63f9173a463ba4e5765c08cf7238/data"
              style="width:70px; height:70px; 
              display: inline-flex;" 
              viewbox="0 0 32 32" 
              class="svg-icon" 
              type="image/svg+xml">
          </div>
        </div>
      </div>`;

      document.querySelector('#criticalHabitat').innerHTML = `
      <div style = margin-top: 10px>
        <p style = "margin-bottom: 2px;">CRITICAL HABITAT DESIGNATION</p>
        <div class = "ecoregionInformation">
          <p>${habitatDetails.criticalHabitat}</p>
        </div>
      </div>
      `;

      document.querySelector('#protectedAreas').innerHTML = `
      <div>
        <p style = "margin-bottom: 2px;">PROTECTED AREAS, TRIBAL LANDS, </br>& WILDERNESS AREAS</p>
        <div class = "ecoregionInformation">
          <p>${habitatDetails.protectedAreas}</p>
        </div>
      </div>
      `;
    }

  const noPopulationValue = () => {
    console.log("there's nothing there");
  }
});