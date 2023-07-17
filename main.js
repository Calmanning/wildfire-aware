require([
	'esri/config',
	'esri/WebMap',
	'esri/views/MapView',
	'esri/widgets/Search',
	'esri/widgets/Home',
	'esri/widgets/DistanceMeasurement2D',
	'esri/Graphic',
	'esri/symbols/SimpleLineSymbol',
	'esri/layers/GraphicsLayer',
	'esri/core/reactiveUtils',
	'esri/geometry/Point',
	'esri/geometry/Circle',
	'esri/layers/support/TileInfo',
], (
	esriConfig,
	WebMap,
	MapView,
	Search,
	Home,
	DistanceMeasurement2D,
	Graphic,
	SimpleLineSymbol,
	GraphicsLayer,
	reactiveUtils,
	Point,
	Circle,
	TileInfo
) => {
	'use strict';

	//CONFIGURABLES
	//Enivronment
	const ENV = window.location.host;
	const config =
		ENV === 'livingatlasdev.arcgis.com' || 'localhost'
			? //DEVELOPMENT ENVIRONMENT
			  {
					webmapID: '068b64e0e1b740e385fa746758b03750',
					queryURLs: {
						aggregatePerimeterURL:
							'https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/Wildfire_aggregated_v1/FeatureServer/1/query',
						populatedBlockCentroidsURL:
							'https://services.arcgis.com/jIL9msH9OI208GCb/ArcGIS/rest/services/Populated_Blocks_2023/FeatureServer/2/query',
					},
			  }
			: //PRODUCTION ENIRONMENT
			  {
					webmapID: 'd4ec5d878d00465cb884a6c610aa5442',
					queryURLs: {
						aggregatePerimeterURL:
							'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/Wildfire_aggregated_v1/FeatureServer/1/query',
						populatedBlockCentroidsURL:
							'https://services.arcgis.com/jIL9msH9OI208GCb/ArcGIS/rest/services/Populated_Block_Centroids_2020_v3/FeatureServer/1/query',
					},
			  };

	console.log(ENV);
	console.log(config);
	//WebmapID
	const webmapID = config.webmapID;
	//Query URLs
	const aggregatePerimeterURL = config.queryURLs.aggregatePerimeterURL;
	const populatedBlockCentroidsURL =
		config.queryURLs.populatedBlockCentroidsURL;

	//DOM VARIABLES
	const viewURL = new URL(window.location.href);
	const sideBarContainer = document.querySelector('#sideBar');
	const sideBarToggleArrow = document.querySelector('#sideBarToggleArrow');
	const searchWidgetContainer = document.querySelector('#searchContainer');
	const topRightContainer = document.querySelector('.top-right-container');
	const sideBarInformation = document.getElementById('sideBarInformation');
	const fireListEl = document.querySelector('#fire-list');
	const fireListBtn = document.querySelector('#fire-list-Btn');
	const firesSortingContainer = document.querySelector('#activeFiresDropdown');
	const fireListSorting = document.querySelector('#fireSorting');
	const infoItemHeader = document.getElementsByClassName('item-header');
	const infoItemContent = document.getElementsByClassName('item-content');
	const fireListItem = document.getElementsByClassName('fire-item');

	//distance measure widget
	let distanceMeasure;
	let isMeasureActive = false;

	//FireList variables
	const dateSortedList = [];
	let personnelSorted = [];
	const sorting = document.querySelectorAll('.sortClass');

	//Layer list and associated elements
	//the layers for the map
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

	const layerList = document.querySelector('#layers');
	const layerListBackground = document.querySelector(
		'.layer-List-Container-background'
	);
	const layerListBtn = document.querySelector('#layer-list-button');
	const firePointsLayerCheckbox = document.querySelector('#fire-points');
	const firePointLegend = document.querySelector('#fire-points-legend');
	const firePermieterLayerCheckbox = document.querySelector('#fire-perimeters');
	const firePerimeterLegend = document.querySelector('#fire-perimeter-legend');
	const watchesAndWarningsCheckbox = document.querySelector(
		'#watchesAndWarnings'
	);
	const watchesAndWarningsLegend = document.querySelector(
		'#watchesAndWarnings-img-legend'
	);
	const satelliteHotspotsCheckbox = document.querySelector(
		'#satellite-hotspots'
	);
	const satelliteHotSpotLegend = document.querySelector(
		'#SatelliteHotSpot-img-legend'
	);
	const AQITodayCheckbox = document.querySelector('#AQI-today');
	const aqiTodayLegend = document.querySelector('#aqiToday-img-legend');
	const AQITomorrowCheckbox = document.querySelector('#AQI-tomorrow');
	const aqiTomorrowLegend = document.querySelector('#aqiTomorrow-img-legend');
	const burnedAreasCheckbox = document.querySelector('#burned-areas');
	const burnedAreasLegend = document.querySelector('#burnedAreas-img-legend');
	const censusPointsCheckbox = document.querySelector('#census-points');
	const censusPointLegend = document.querySelector('#population-points-legend');

	//MAP COMPONENTS

	const webmap = new WebMap({
		portalItem: {
			id: webmapID,
		},
		layers: [],
	});

	const mapView = new MapView({
		container: 'viewDiv',
		// map: webmap,
		spatialReference: 102100,
		popup: {
			popup: null,
			autoOpenEnabled: false,
		},
	});

	// const tileInfo = TileInfo.create({
	// 	spatialReference: {
	// 		wkid: 102100,
	// 	},
	// 	numLODs: 32,
	// });
	// const lods = tileInfo.lods;

	const graphicsLayer = new GraphicsLayer({
		graphics: [],
	});

	webmap
		.load()
		.then(() => {
			webmap.basemap.load();
		})
		.then(() => {
			mapView.map = webmap;
			// mapView.constraints = {
			// 	lods: lods,
			// 	rotationEnabled: false,
			// 	snapToZoom: true,
			// };
			document.querySelector('.loader').classList.remove('is-active');
		})
		.catch((error) => {
			console.log(error);
		});

	//WIDGETS
	const searchWidget = new Search({
		view: mapView,
		resultGraphicEnabled: false,
		popupEnabled: false,
		container: topRightContainer,
	});

	const homeWidget = new Home({
		view: mapView,
		// container: topRightContainer,
	});

	homeWidget.goToOverride = () => {
		resetURLParams();
		(fireListEl.style.display = 'initial'),
			(fireListBtn.style.display = 'none'),
			(sideBarInformation.style.display = 'none'),
			(fireListSorting.style.display = 'initial'),
			removePreviousFireIcon();
		removeCircleGraphic();
		scrollToTop();

		if (window.screen.width <= 820) {
			return mapView.goTo(
				{
					zoom: 5,
					center: [255, 39],
					spatialReference: {
						wkid: 102100,
					},
				},
				{ duration: 1000 }
			);
		}

		return mapView.goTo(
			{
				zoom: 4,
				center: [245, 48],
				spatialReference: {
					wkid: 102100,
				},
			},
			{ duration: 1000 }
		);
	};

	// const distanceMeasure = new DistanceMeasurement2D({
	// 	view: mapView,
	// 	container: 'distanceMeasurementBtn',
	// 	unitOptions: ['miles', 'yards', 'feet'],
	// });

	// const measureBtnText = `MEASURE`;
	// const hintText = `
	// Click on the map to start measuring
	// `;
	// const newMessageText = {
	// 	messages: {
	// 		newMeasurement: measureBtnText,
	// 		hint: hintText,
	// 	},
	// };

	const resetURLParams = () => {
		window.location.hash = '';
	};

	//ON MAP LOAD
	const loadMapview = (() => {
		mapView
			.when()
			.then(() => {
				firePoints = webmap.allLayers.find((layer) => {
					return layer.title === 'Current Incidents';
				});

				firePoints.outFields = [
					'IRWINID',
					'IncidentName',
					'ModifiedOnDateTime',
					'FireDiscoveryDateTime',
					'FireDiscoveryAge',
					'IncidentTypeCategory',
					'DailyAcres',
					'PercentContained',
				];

				fireArea = webmap.allLayers.find((layer) => {
					return layer.title === 'Current Perimeters Fill';
				});

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
				];

				firePerimeter = webmap.allLayers.find((layer) => {
					return layer.title === 'Current Perimeters Outline';
				});
				firePerimeter.outFields = 'IrwinID';

				weatherWatchesAndWarningsLayer = webmap.allLayers.find((layer) => {
					return layer.title === 'Weather Watches and Warnings';
				});

				satelliteHotspotsLayer = webmap.allLayers.find((layer) => {
					return layer.title === 'Satellite Hotspots';
				});

				AQITodayLayer = webmap.allLayers.find((layer) => {
					return layer.title === "Today's AQI Forecast";
				});

				AQITomorrowLayer = webmap.allLayers.find((layer) => {
					return layer.title === "Tomorrow's AQI Forecast";
				});

				burnedAreasFillLayer = webmap.allLayers.find((layer) => {
					return layer.title === 'Burned Areas 1984 - 2020 Fill';
				});

				burnedAreasPerimeterLayer = webmap.allLayers.find((layer) => {
					return layer.title === 'Burned Areas Outline';
				});

				censusLayer = webmap.allLayers.find((layer) => {
					return layer.title === '2020 Census Block Centroids';
				});
			})
			.then(() => {
				//ADD WIDGETS
				mapView.ui.add(searchWidget, 'top-right');
				mapView.ui.move('zoom', { position: 'top-right' });
				mapView.ui.add(homeWidget, 'top-right');
				//you've been using this for reference: https://developers.arcgis.com/javascript/latest/sample-code/sandbox/?sample=widgets-measurement-2d
				mapView.ui.add('distanceMeasurementBtn', { position: 'bottom-right' });
				mapView.ui.add(measurementWrapper, { position: 'bottom-right' });
				webmap.add(graphicsLayer);

				// mapView.ui.add(measurementWrapper, { position: 'bottom-right' });
				// distanceMeasure.set(newMessageText);

				// distanceMeasure.messages.newMeasurement = measureBtnText;
				// distanceMeasure.messages.hint = hintText;
				// distanceMeasure.viewModel.palette.pathPrimaryColor = [17, 49, 43, 255]; //[255, 0, 0, 255]
				// distanceMeasure.viewModel.palette.pathSecondaryColor = [
				// 	255, 255, 255, 255,
				// 	// 255, 186, 31, 255,
				// ];
				// distanceMeasure.viewModel.palette.handleColor = [255, 255, 255, 255];
			})
			.then(() => {
				//setting up view -- if url-information is relevant have the view reflect that information, otherwise set center on continental US.
				if (window.location.hash) {
					const newDefaultLocation = window.location.hash.substring(3);
					parseURLHash({ newDefaultLocation });
					return;
				}
				initialMapExtent();
			})
			.then(() => {
				layerListBtn.addEventListener('click', (event) => {
					addLayerList(event);
				});
			})
			.catch((error) => {
				console.error(error);
			});
	})();

	const addLayerList = (event) => {
		layerList.style.display === 'none'
			? ((layerList.style.display = 'initial'),
			  layerListBackground.classList.add('blue-background'),
			  changelayerListButtonText(),
			  setLayerListBtnColor())
			: resetLayerList();
	};

	const changelayerListButtonText = () => {
		layerList.style.display === 'none'
			? (layerListBtn.innerText = 'MAP LAYERS')
			: (layerListBtn.innerText = 'CLOSE');
	};

	const setLayerListBtnColor = () => {
		if (!layerListBtn.classList.contains('open-list')) {
			layerListBtn.classList.add('open-list');
		} else {
			layerListBtn.classList.remove('open-list');
		}
	};

	const closeLayerList = () => {
		layerList.style.display = 'none';
		layerListBackground.classList.remove('blue-background');
		changelayerListButtonText();
	};

	//LAYER LIST VISIBILITY TOGGLE

	//NOTE: this function is called by all legend-img-divs.
	//NOTE: may need to make the conditioning more explicit
	const toggleLegendDivVisibility = (legendDivId) => {
		if (legendDivId.style.display === 'initial') {
			legendDivId.style.display = 'none';
		} else {
			legendDivId.style.display = 'initial';
		}
	};

	const hideAllLegendDivs = () => {
		// satelliteHotSpotLegend.style.display = 'none';
		aqiTodayLegend.style.display = 'none';
		aqiTomorrowLegend.style.display = 'none';
		watchesAndWarningsLegend.style.display = 'none';
		burnedAreasLegend.style.display = 'none';
		censusPointLegend.style.display = 'none';

		// closeLayerList();
	};

	const enableMapLayer = (enabledLayer) => {
		enabledLayer.removeAttribute('disabled');
		enabledLayer.parentElement.classList.remove('disable');
		enabledLayer.parentElement.classList.remove('tooltip');
	};

	const disableMapLayer = (disabledLayer) => {
		disabledLayer.setAttribute('disabled', '');
		disabledLayer.parentElement.classList.add('disable');
		disabledLayer.parentElement.classList.add('tooltip');
		hideLegendDiv(disabledLayer);
	};

	const showLegendDiv = (enabledLayer) => {
		// disabledLayer.checked = false;
		enabledLayer.parentElement.nextElementSibling.style.display = 'initial';
	};

	const hideLegendDiv = (disabledLayer) => {
		// disabledLayer.checked = false;
		disabledLayer.parentElement.nextElementSibling.style.display = 'none';
	};

	const toggleFirePointsLayerVisibility = (() => {
		firePointsLayerCheckbox.addEventListener('change', () => {
			firePoints.visible = firePointsLayerCheckbox.checked;
			toggleLegendDivVisibility(firePointLegend);
			toggleFireGraphicVisibility();
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
			weatherWatchesAndWarningsLayer.visible =
				watchesAndWarningsCheckbox.checked;
			toggleLegendDivVisibility(watchesAndWarningsLegend);

			if (aqiTodayLegend.style.display !== 'none') {
				AQITodayCheckbox.checked = false;
				AQITodayLayer.visible = false;
				toggleLegendDivVisibility(aqiTodayLegend);
			}

			if (aqiTomorrowLegend.style.display !== 'none') {
				AQITomorrowCheckbox.checked = false;
				AQITomorrowLayer.visible = false;
				toggleLegendDivVisibility(aqiTomorrowLegend);
			}

			if (burnedAreasLegend.style.display !== 'none') {
				burnedAreasCheckbox.checked = false;
				burnedAreasFillLayer.visible = false;
				burnedAreasPerimeterLayer.visible = false;
				toggleLegendDivVisibility(burnedAreasLegend);
			}
		});
	})();

	const toggleSatelliteHotSpotsVisibility = (() => {
		satelliteHotspotsCheckbox.addEventListener('change', () => {
			satelliteHotspotsLayer.visible = satelliteHotspotsCheckbox.checked;
			toggleLegendDivVisibility(satelliteHotSpotLegend);
		});
	})();

	const toggleAQITodayVisibility = (() => {
		AQITodayCheckbox.addEventListener('change', (event) => {
			AQITodayLayer.visible = AQITodayCheckbox.checked;
			toggleLegendDivVisibility(aqiTodayLegend);

			if (aqiTomorrowLegend.style.display !== 'none') {
				AQITomorrowCheckbox.checked = false;
				AQITomorrowLayer.visible = false;
				toggleLegendDivVisibility(aqiTomorrowLegend);
			}

			if (watchesAndWarningsLegend.style.display !== 'none') {
				watchesAndWarningsCheckbox.checked = false;
				weatherWatchesAndWarningsLayer.visible = false;
				toggleLegendDivVisibility(watchesAndWarningsLegend);
			}

			if (burnedAreasLegend.style.display !== 'none') {
				burnedAreasCheckbox.checked = false;
				burnedAreasFillLayer.visible = false;
				burnedAreasPerimeterLayer.visible = false;
				toggleLegendDivVisibility(burnedAreasLegend);
			}

			aqiTodayLegend.visible === true
				? (aqiTodayLegend.parentElement.style.marginBottom = null)
				: (aqiTodayLegend.parentElement.style.marginBottom = 0);
		});
	})();

	const toggleAQITomorrowVisibility = (() => {
		AQITomorrowCheckbox.addEventListener('change', () => {
			AQITomorrowLayer.visible = AQITomorrowCheckbox.checked;
			toggleLegendDivVisibility(aqiTomorrowLegend);

			if (aqiTodayLegend.style.display !== 'none') {
				AQITodayCheckbox.checked = false;
				AQITodayLayer.visible = false;
				toggleLegendDivVisibility(aqiTodayLegend);
			}

			if (watchesAndWarningsLegend.style.display !== 'none') {
				watchesAndWarningsCheckbox.checked = false;
				weatherWatchesAndWarningsLayer.visible = false;
				toggleLegendDivVisibility(watchesAndWarningsLegend);
			}

			if (burnedAreasLegend.style.display !== 'none') {
				burnedAreasCheckbox.checked = false;
				burnedAreasFillLayer.visible = false;
				burnedAreasPerimeterLayer.visible = false;
				toggleLegendDivVisibility(burnedAreasLegend);
			}
		});
	})();

	const toggleBurnedAreasVisibility = (() => {
		burnedAreasCheckbox.addEventListener('change', () => {
			burnedAreasFillLayer.visible = burnedAreasCheckbox.checked;
			burnedAreasPerimeterLayer.visible = burnedAreasCheckbox.checked;
			toggleLegendDivVisibility(burnedAreasLegend);

			if (aqiTodayLegend.style.display !== 'none') {
				AQITodayCheckbox.checked = false;
				AQITodayLayer.visible = false;
				toggleLegendDivVisibility(aqiTodayLegend);
			}

			if (aqiTomorrowLegend.style.display !== 'none') {
				AQITomorrowCheckbox.checked = false;
				AQITomorrowLayer.visible = false;
				toggleLegendDivVisibility(aqiTomorrowLegend);
			}

			if (watchesAndWarningsLegend.style.display !== 'none') {
				watchesAndWarningsCheckbox.checked = false;
				weatherWatchesAndWarningsLayer.visible = false;
				toggleLegendDivVisibility(watchesAndWarningsLegend);
			}
		});
	})();

	const toggleCensusPopulationVisibility = (() => {
		censusPointsCheckbox.addEventListener('change', () => {
			censusLayer.visible = censusPointsCheckbox.checked;
			toggleLegendDivVisibility(censusPointLegend);
		});
	})();

	const resetLayerList = () => {
		closeLayerList();
		setLayerListBtnColor();
	};

	//SETTING THE CENTER OF MAP VIEW ON PAGE LOAD. NOTE: is there a better placement in the code for this function?
	const initialMapExtent = () => {
		if (window.screen.width <= 820) {
			return mapView.goTo(
				{
					zoom: 6,
					center: [255, 39],
					spatialReference: {
						wkid: 102100,
					},
				},
				{ duration: 1000 }
			);
		} else {
			return mapView.goTo(
				{
					zoom: 5,
					center: [262, 40],
					spatialReference: {
						wkid: 102100,
					},
				},
				{ duration: 1000 }
			);
		}
	};

	const parseURLHash = async ({ newDefaultLocation }) => {
		const URLLocationParams = newDefaultLocation.split(',');

		const URLLocationCoordinates = {
			x: URLLocationParams[0],
			y: URLLocationParams[1],
		};

		const mapPoint = new Point(URLLocationCoordinates);

		if (URLLocationParams[3] && URLLocationParams[3] === 'loc') {
			//use URLLocationCoordinates to query location info
			queryHub({ mapPoint });
			newEcoQuery({ mapPoint });
			censusBlockCentroidQuery({ mapPoint });
			addCircleGraphic({ mapPoint });
			// updateURLParams({mapPoint})
		} else if (URLLocationParams[3] && URLLocationParams[3].length >= 35) {
			//use irwinID to collect fire info and use that to collect the surrounding information.
			const irwinID = URLLocationParams[3];
			selectedFireInfoQuery({ irwinID });
		} else {
			await goto({ mapPoint });

			setTimeout(() => {
				URLLocationParams[2] !== '12'
					? (mapView.zoom = URLLocationParams[2])
					: null;
			}, 1000);
		}
	};

	//MAP GRAPHIC(S)

	const circle = new Graphic({
		symbol: {
			type: 'simple-fill',
			color: [0, 0, 0, 0],
			outline: new SimpleLineSymbol({
				color: [255, 186, 31, 1],
				style: 'long-dash',
				width: 2,
			}),
		},
	});

	//MAP POINT GRAPHIC FUNCTION
	const addCircleGraphic = async ({ mapPoint, fireLocation }) => {
		const circleGeometry = new Circle({
			center: mapPoint || fireLocation,
			geodesic: true,
			numberOfPoints: 200,
			radius: 2,
			radiusUnit: 'miles',
		});

		circle.symbol.outline.style = mapView.zoom <= 8 ? 'solid' : 'long-dash';
		circle.geometry = circleGeometry;

		mapView.graphics.add(circle);
	};

	const removeCircleGraphic = async () => {
		mapView.graphics.removeAll();
	};

	//RENDER CENSUS SELECTED TRACT

	const fireGraphic = async ({ fireIconGraphicInfo, fireInformation }) => {
		const fireLocation = fireInformation
			? fireInformation[0].split(',')
			: fireIconGraphicInfo.geometry;

		const firePersonnelSize = fireInformation
			? fireInformation[3].split(' ')[0]
			: fireIconGraphicInfo.attributes.TotalIncidentPersonnel;

		await removePreviousFireIcon();

		const fireIconGraphic = new Graphic({
			geometry: {
				type: 'point',
				x: fireLocation.x || +fireLocation[0],
				y: fireLocation.y || +fireLocation[1],
			},
			symbol: {
				type: 'simple-marker',
				size: 17,
				color: [17, 54, 81, 1],
				outline: {
					width: 2,
					color: [255, 186, 31],
				},
			},
		});

		if (parseInt(firePersonnelSize) > 500) {
			fireIconGraphic.symbol.size = 33;
		} else if (parseInt(firePersonnelSize) < 500) {
			fireIconGraphic.symbol.size = 30;
		} else if (parseInt(firePersonnelSize) < 50 || NaN) {
			fireIconGraphic.symbol.size = 17;
		}

		webmap.layers.reorder(graphicsLayer, 11);
		graphicsLayer.graphics.push(fireIconGraphic);
	};

	const removePreviousFireIcon = async () => {
		graphicsLayer.graphics ? graphicsLayer.graphics.pop() : null;
	};

	const toggleFireGraphicVisibility = () => {
		graphicsLayer.graphics.items[0].visible = firePoints.visible;
	};

	const goto = async ({ mapPoint }) => {
		if (mapView.zoom > 10) {
			return;
		}

		const opts = {
			duration: 1000,
			animate: true,
		};
		mapView
			.goTo(
				{
					target: mapPoint,
					zoom: 12,
				},
				opts
			)

			.catch((error) => {
				console.error(error);
			});
	};

	//FORMATTING THE FIRST ENTRY IN THE FIRE LIST
	const formatFirstFireItem = () => {
		fireListItem[0].style.marginTop = '39px';
	};

	//List of fires in dropdown
	const formatActiveFires = (sortedFireList) => {
		if (!sortedFireList.length) {
			fireListEl.innerHTML = '';

			return;
		}

		const fires = sortedFireList.map((fire) => {
			if (typeof fire === 'object') {
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
				};

				return `
      <div class = "fire-item padding-left-2" style = "margin-bottom: 15px; cursor: pointer;" value="${
				fireListItem.fireLocation
			}, ${fireListItem.fireId}, ${fireListItem.fireType}, ${
					fireListItem.firePersonnel
				}" > 
        <h5 style ="font-weight: bold; margin-bottom: -4px; color: #ffb600; line-height: 21px;" value="${
					fireListItem.fireLocation
				}, ${fireListItem.fireId}, ${fireListItem.fireType}, ${
					fireListItem.firePersonnel
				}">${fireListItem.fireName} </h5>
        
        <p value="${fireListItem.fireLocation}, ${fireListItem.fireId}, ${
					fireListItem.fireType
				}, ${fireListItem.firePersonnel}">${
					sorting[0].classList.contains('underline')
						? fireListItem.firePersonnel
						: fireListItem.fireAcres
				}</p>
        
      </div>
      `;
			}

			return `<p class = "trailer-0 fire-list-date" style = "margin-top: 1rem; cursor: default;">${fire.toUpperCase()}</p>`;
		});

		fireListEl.innerHTML = [...fires].join('');

		!fires[0].includes('h5') ? null : formatFirstFireItem();
		fireItemEvents();
	};

	//TODO: change this function name. Too common. Not descriptive.
	const setFireContentInfo = ({ fireData }) => {
		const recentFireData = new Date(
			fireData.modifiedOnDateTime
		).toLocaleDateString(undefined, {
			month: 'long',
			day: 'numeric',
			year: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
		});

		const fireDate = new Date(
			fireData.fireDiscoveryDateTime
		).toLocaleDateString(undefined, {
			hour: 'numeric',
			minute: 'numeric',
			month: 'long',
			day: 'numeric',
			year: 'numeric',
		});

		const fireAge = fireData.fireDiscovery;

		const fireName = fireData.incidentName.toUpperCase();

		const fireCounty = fireData.county.toUpperCase();

		const fireState = fireData.state.substring(3);

		const fireAcres = fireData.dailyAcres;

		const firePersonnel = fireData.personnelAssigned.toLocaleString();

		const fireType = fireData.incidentType;

		const fireIcon = () => {
			if (fireData.personnelAssigned && fireType === 'PRESCRIBED FIRE') {
				return 'https://www.arcgis.com/sharing/rest/content/items/4078350792ea4da2b36cab7351909fd7/data';
			} else if (typeof fireData.personnelAssigned === 'number') {
				return 'https://esri.maps.arcgis.com/sharing/rest/content/items/b56beb3d45d14b63af0113901dd767f7/data';
			} else if (typeof fireData.personnelAssigned === 'string') {
				return 'https://www.arcgis.com/sharing/rest/content/items/6f3a489a81a54494a1b57cb577e92fcb/data';
			}
		};

		const fireHeader = (infoItemHeader[0].innerHTML = `
                          <p class = "trailer-0 sectionHeader">FIRE INFORMATION</p>
                          <p class="sectionSubHeader">Current as of:  ${recentFireData.toUpperCase()} </p>`);

		infoItemContent[0].setAttribute('style', 'display: inline');

		const fireTitleInfo = (infoItemContent[0].innerHTML = `
          <div style="display: inline-flex; margin-top: -5px;">
              <img src= ${fireIcon({ fireType, fireAge })} 
                style="width:64px; height:64px;" 
                viewbox="0 0 32 32" 
                class="svg-icon" 
                type="image/svg+xml"/>
              <div>
                <h4 class = "bold trailer-0" style= "line-height: 0px;"><b>${fireName}</b></h4>
                <p class = "trailer-0" style = "font-size: 0.875rem;" >${fireCounty} COUNTY, ${fireState}</p>
                <p class = "trailer-0" style = "font-size: 0.875rem;" >INCIDENT TYPE: ${fireType}</p>
                <p class = "trailer-0" style = "font-size: 0.875rem; white-space:nowrap" >START: ${fireDate.toUpperCase()}</p>
              </div>
          </div>
          
          <div>
            <div class = "trailer-0 " style= "margin-top: 10px;"> 
              <span style = "vertical-align: 2px; margin: 0 5px 0px 103px"> DAY </span> <h4 class = "bold trailer-0" style = "white-space: nowrap;"> ${
								window.screen.width > 700
									? fireAge
									: fireAge > 0
									? fireAge
									: '< 24 hours'
							}</h4>
            </div>
            <div class = "trailer-0 " style= "margin-top: 10px;"> 
              <span style = "vertical-align: 2px; margin: 0 5px 0px 45px;"> PERSONNEL </span> <h4 class = "bold trailer-0" style = "white-space: nowrap;"> ${firePersonnel}</h4>
            </div>
            <div class = "trailer-0" style = "margin: 5px auto;">
              <span style = "vertical-align: text-bottom; margin: 0 5px 0px 5px"> REPORTED ACRES </span> <h4 class = "bold trailer-0"> ${
								fireAcres ? fireAcres.toLocaleString() : 'Not reported'
							}</h4>
            </div>
          </div>
          <div id = 'containment' style = 'display:inline-flex'>
            <p class = "trailer-0" style="margin-top: 5px;">
              <span style = "vertical-align: text-bottom; margin: 0 5px 0 23px;">CONTAINMENT</span>
              <span id = "containment-text"></span>
            </p>
            </div>
          `);

		fireHeader;
		fireTitleInfo;

		containmentBar(fireData.percentContained);
	};

	//EVENT LISTENERS
	reactiveUtils.when(
		() => mapView?.stationary,
		() => {
			let extentGeometry = mapView.extent;
			getFiresByExtent({ extentGeometry });
		}
	);

	reactiveUtils.watch(
		() => mapView?.zoom,
		async () => {
			if (!(mapView.zoom >= 0 && mapView.zoom <= 11)) {
				disableMapLayer(AQITodayCheckbox);
				disableMapLayer(AQITomorrowCheckbox);
				AQITodayLayer.visible = false;
				AQITomorrowLayer.visible = false;
				if (
					aqiTodayLegend.style.display === 'intitial' ||
					aqiTomorrowLegend.style.display === 'intitial'
				)
					toggleLegendDivVisibility(aqiTodayLegend || aqiTomorrowLegend);
			} else {
				if (
					AQITodayCheckbox.attributes.disabled ||
					AQITomorrowCheckbox.attributes.disabled
				) {
					enableMapLayer(AQITodayCheckbox);
					enableMapLayer(AQITomorrowCheckbox);
					AQITodayCheckbox.checked === true
						? ((AQITodayLayer.visible = AQITodayCheckbox.checked),
						  showLegendDiv(AQITodayCheckbox))
						: (AQITodayCheckbox.visible = false);
					AQITomorrowCheckbox.checked === true
						? ((AQITomorrowLayer.visible = AQITomorrowCheckbox.checked),
						  showLegendDiv(AQITomorrowCheckbox))
						: (AQITomorrowLayer.visible = false);
				}
			}

			if (!(mapView.zoom >= 0 && mapView.zoom <= 11)) {
				disableMapLayer(watchesAndWarningsCheckbox);
				weatherWatchesAndWarningsLayer.visible = false;
				watchesAndWarningsCheckbox.checked;
			} else {
				enableMapLayer(watchesAndWarningsCheckbox);
				if (watchesAndWarningsCheckbox.checked === true) {
					showLegendDiv(watchesAndWarningsCheckbox);
					weatherWatchesAndWarningsLayer.visible = true;
				}
			}

			if (mapView.zoom <= 7) {
				disableMapLayer(satelliteHotspotsCheckbox);
				satelliteHotspotsLayer.visible = false;
				satelliteHotspotsCheckbox.checked = false;
				satelliteHotSpotLegend.style.display = 'none';
			} else {
				enableMapLayer(satelliteHotspotsCheckbox);
				satelliteHotspotsLayer.visible = true;
				satelliteHotspotsCheckbox.checked = true;
				satelliteHotSpotLegend.style.display = 'initial';
			}

			if (!(mapView.zoom >= 0 && mapView.zoom <= 11)) {
				disableMapLayer(burnedAreasCheckbox);
				burnedAreasFillLayer.visible = false;
				burnedAreasPerimeterLayer.visible = false;
			} else {
				enableMapLayer(burnedAreasCheckbox);
				if (burnedAreasCheckbox.checked === true) {
					showLegendDiv(burnedAreasCheckbox);
					burnedAreasFillLayer.visible = true;
					burnedAreasPerimeterLayer.visible = true;
				}
			}

			if (!(mapView.zoom >= 12 && mapView.zoom <= 15)) {
				disableMapLayer(censusPointsCheckbox);
				censusLayer.visible = false;
			} else {
				enableMapLayer(censusPointsCheckbox);
				if (censusPointsCheckbox.checked === true) {
					showLegendDiv(censusPointsCheckbox);
					censusLayer.visible = true;
				}
			}

			if (
				mapView.zoom <= 9 &&
				mapView.graphics.items.length > 0 &&
				graphicsLayer.graphics.items.length > 0
			) {
				const solidCircle = circle.clone();
				solidCircle.symbol.outline.style = 'solid';

				await removeCircleGraphic();

				mapView.graphics.add(solidCircle);
				mapView.graphics.items[0].visible = false;
			} else if (
				mapView.zoom >= 10 &&
				mapView.graphics.items.length > 0 &&
				graphicsLayer.graphics.items.length > 0
			) {
				const longDashCircle = circle.clone();
				longDashCircle.symbol.outline.style = 'long-dash';

				await removeCircleGraphic();

				mapView.graphics.add(longDashCircle);
				mapView.graphics.items[0].symbol.outline.style = 'long-dash';
				mapView.graphics.items[0].visible = true;
			} else if (
				mapView.zoom <= 8 &&
				mapView.graphics.items.length > 0 &&
				graphicsLayer.graphics.items.length === 0
			) {
				const solidCircle = circle.clone();
				solidCircle.symbol.outline.style = 'solid';

				await removeCircleGraphic();

				mapView.graphics.add(solidCircle);
			} else if (
				mapView.zoom >= 9 &&
				mapView.graphics.items.length > 0 &&
				graphicsLayer.graphics.items.length === 0
			) {
				const longDashCircle = circle.clone();
				longDashCircle.symbol.outline.style = 'long-dash';

				await removeCircleGraphic();

				mapView.graphics.add(longDashCircle);
			}
		}
	);

	const sizeReport = () => {
		if (window.screen.width > 800) {
			sideBarContainer.style.height
				? (sideBarContainer.style.height = null)
				: null;
		}
	};

	window.addEventListener('load', sizeReport, false);
	window.addEventListener('resize', sizeReport, false);
	// let mapClickEvent;

	//you've been using this for reference: https://developers.arcgis.com/javascript/latest/sample-code/sandbox/?sample=widgets-measurement-2d
	//this too: https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-DistanceMeasurement2D.html#constructors-summary
	document
		.querySelector('#distanceMeasurementBtn')
		.addEventListener('click', (event) => {
			if (!isMeasureActive) {
				event.target.closest('#distanceMeasurementBtn').classList.add('active');
				const widgetContainer = document.createElement('div');
				widgetContainer.setAttribute('id', 'measureWidget');
				document
					.querySelector('#measurementWrapper')
					.appendChild(widgetContainer);

				distanceMeasure = new DistanceMeasurement2D({
					view: mapView,
					container: 'measureWidget',
					unitOptions: ['miles', 'yards', 'feet'],
					messages: {
						newMeasurement: `MEASURE`,
					},
				});

				const measureBtnText = `MEASURE`;
				const hintText = `
        Click on the map to start measuring
        `;

				const newMessageText = {
					messages: {
						newMeasurement: measureBtnText,
						hint: hintText,
					},
				};

				distanceMeasure.when(() => {
					distanceMeasure.messages.newMeasurement = measureBtnText;
					distanceMeasure.messages.hint = hintText;
					distanceMeasure.set(newMessageText);
				});

				mapView.ui.add(measureWidget, { position: 'bottom-right' });

				distanceMeasure.viewModel.palette.pathPrimaryColor = [17, 49, 43, 255]; //[255, 0, 0, 255]
				distanceMeasure.viewModel.palette.pathSecondaryColor = [
					255, 255, 255, 255,
					// 255, 186, 31, 255,
				];
				distanceMeasure.viewModel.palette.handleColor = [255, 255, 255, 255];

				distanceMeasure.viewModel.start();

				console.log(distanceMeasure.messages);
				isMeasureActive = true;
				console.log(isMeasureActive);
			} else {
				event.target
					.closest('#distanceMeasurementBtn')
					.classList.remove('active');
				mapView.ui.remove(distanceMeasure);
				distanceMeasure.destroy();
				// document
				// 	.querySelector('#distanceMeasureText')
				// 	.classList.add('invisible');
				isMeasureActive = false;
				console.log(isMeasureActive);
				console.log(distanceMeasure);
			}
		});

	let mapClickEvent = () => {
		mapView.on('click', async (event) => {
			if (isMeasureActive) {
				// document
				// 	.querySelector('#distanceMeasureText')
				// 	.classList.remove('invisible');
				// console.log(distanceMeasure);
				return;
			}

			const mapPoint = JSON.stringify(event.mapPoint);

			if ((await mapPointLocationCheck({ mapPoint })) === false) {
				return;
			}
			await removeCircleGraphic();

			await removePreviousFireIcon();
			// goto({ mapPoint });
			mapHitTest(event);

			window.screen.width <= 800
				? (sideBarContainer.style.height = '100%')
				: null;
			sideBarToggleArrow.style.transform = 'rotate(180deg)';
		});
	};

	mapClickEvent();

	const mapHitTest = (event) => {
		let feature;

		mapView
			.hitTest(event, { include: [firePoints, fireArea, firePerimeter] })
			.then((hitResponse) => {
				if (hitResponse.results.length) {
					feature = hitResponse.results.filter((result) => {
						return result.graphic;
					})[0].graphic;

					const hitTestResponse = feature.attributes;

					feature.sourceLayer.title.includes('Current Incidents')
						? selectedFireInfoQuery({ hitTestResponse })
						: selectedFireInfoQuery({ hitTestResponse });
				} else {
					infoItemHeader[0].innerHTML = '';
					infoItemContent[0].innerHTML = '';

					const mapPoint = event.mapPoint;

					queryHub({ mapPoint });
					newEcoQuery({ mapPoint });
					censusBlockCentroidQuery({ mapPoint });
					addCircleGraphic({ mapPoint });
					updateURLParams({ mapPoint });
				}
			});
	};

	const updateURLParams = ({ mapPoint, irwinIdNumber }) => {
		viewURL.hash = `@=${mapPoint.longitude.toFixed(
			3
		)},${mapPoint.latitude.toFixed(3)},${
			mapView.zoom <= 8 ? 12 : mapView.zoom
		},${irwinIdNumber ? irwinIdNumber : 'loc'}`;

		return (window.location.href = viewURL.hash.toString());
	};

	fireListBtn.addEventListener('click', async () => {
		fireListDisplayToggle();

		await removeCircleGraphic();
		await removePreviousFireIcon();

		resetURLParams();
		resetFireList();
		sideBarInformation.style.display = 'none';
	});

	const fireListDisplayToggle = (mapPoint) => {
		fireListEl.style.display === 'initial' ||
		(mapPoint && fireListEl.style.display)
			? ((fireListEl.style.display = 'none'),
			  (fireListBtn.style.display = 'initial'),
			  (sideBarInformation.style.display = 'initial'),
			  scrollToTop(),
			  (fireListSorting.style.display = 'none'))
			: ((fireListEl.style.display = 'initial'),
			  (fireListBtn.style.display = 'none'),
			  (sideBarInformation.style.display = 'none'),
			  (fireListSorting.style.display = 'initial'),
			  scrollToTop());
	};

	const returnToTopBtnClick = (() => {
		document.querySelector('#return-top-Btn').addEventListener('click', () => {
			scrollToTop();
		});
	})();

	const scrollToTop = () => {
		document.querySelector('#infoBar').scrollTo(0, 0);
	};

	const sideBarToggleView = (() => {
		sideBarToggleArrow.addEventListener('click', (event) => {
			event.preventDefault();
			if (sideBarContainer.style.height === '100%') {
				sideBarContainer.style.height = '0';
				sideBarToggleArrow.style.transform = 'rotate(0deg)';
			} else {
				sideBarContainer.style.height = '100%';
				sideBarToggleArrow.style.transform = 'rotate(180deg)';
			}
		});
	})();

	//Different Ways to sort the fire list
	const sortingOptions = ({ dateSorted, wildFires }) => {
		const wildFiresToSort = wildFires;
		dateSortedList.push(dateSorted);

		let sortingAcrage = [];
		[...sortingAcrage] = wildFires.map((fire) =>
			Object.assign(fire, {
				acreSorting: +fire.attributes.DailyAcres
					? fire.attributes.DailyAcres
					: 0,
			})
		);

		let nameSorted = [...wildFiresToSort];
		nameSorted = nameSorted.sort((a, b) => {
			let fireNames = a.attributes.IncidentName.trim().localeCompare(
				b.attributes.IncidentName.trim()
			);
			return fireNames;
		});

		let acreSorted = [...wildFiresToSort];
		acreSorted = sortingAcrage.sort((a, b) => {
			let fireAcres = b.acreSorting - a.acreSorting;
			return fireAcres;
		});

		personnelSorted = [...wildFiresToSort];
		personnelSorted = wildFiresToSort.sort((a, b) => {
			const personnelAssigned =
				b.attributes.TotalIncidentPersonnel -
				a.attributes.TotalIncidentPersonnel;
			return personnelAssigned;
		});
		personnelSorted.map((personnelFire) => {
			personnelFire.attributes.TotalIncidentPersonnel =
				!personnelFire.attributes.TotalIncidentPersonnel || null
					? 'Not reported'
					: `${personnelFire.attributes.TotalIncidentPersonnel.toLocaleString()} personnel`;
		});

		//If there are no fires. Clear all lists. Set firest in view to '0'.
		if (!dateSorted.length || !wildFires.length) {
			formatActiveFires(0);
			firesInView(0);
			renderFireListClickEvent({
				personnelSorted,
				dateSorted,
				nameSorted,
				acreSorted,
			});
			return;
		}

		sorting.forEach((sortCategory) => {
			if (
				sortCategory.innerText.includes('PERSONNEL') &&
				sortCategory.classList.contains('underline')
			) {
				formatActiveFires(personnelSorted);
			} else if (
				sortCategory.innerText.includes('DATE') &&
				sortCategory.classList.contains('underline')
			) {
				formatActiveFires(dateSorted);
			} else if (
				sortCategory.innerText.includes('NAME') &&
				sortCategory.classList.contains('underline')
			) {
				formatActiveFires(nameSorted);
			} else if (
				sortCategory.innerText.includes('SIZE') &&
				sortCategory.classList.contains('underline')
			) {
				formatActiveFires(acreSorted);
			}
		});

		renderFireListClickEvent({
			personnelSorted,
			dateSorted,
			nameSorted,
			acreSorted,
		});
	};

	//click event to re-render list in new order
	const renderFireListClickEvent = ({
		personnelSorted,
		dateSorted,
		nameSorted,
		acreSorted,
	}) => {
		sorting.forEach((sortCategory) => {
			sortCategory.addEventListener('click', (event) => {
				!event.target.classList.contains('underline')
					? (sorting.forEach((item) => {
							item.classList.remove('underline');
					  }),
					  event.target.classList.add('underline'))
					: null;

				if (event.target.innerText.includes('PERSONNEL')) {
					formatActiveFires(personnelSorted);
				} else if (event.target.innerText.includes('DATE')) {
					formatActiveFires(dateSorted);
				} else if (event.target.innerText.includes('NAME')) {
					formatActiveFires(nameSorted);
				} else if (event.target.innerText.includes('SIZE')) {
					formatActiveFires(acreSorted);
				}
			});
		});
	};

	const resetFireList = () => {
		sorting.forEach((sortCategory) => {
			sortCategory.classList.remove('underline');
		});

		document.querySelector('#fire-personnel').classList.add('underline');

		formatActiveFires(personnelSorted);
		formatFirstFireItem();
	};

	const firesInView = (number) => {
		const firesInViewEl = document.getElementById('firesInView');

		const fireSpan = `<span style="font-size: 24px; font-weight: bold; color: #FFBA1F; margin-right: 5px;"> ${number} </span> <span style="font-size: 20px;">FIRES IN VIEW</span>`;

		firesInViewEl.innerHTML = fireSpan;
	};

	//FEATURE SERVICE QUERIES
	//is the mapClick point within the Unites States?
	const mapPointLocationCheck = async ({ mapPoint }) => {
		return new Promise((resolve) => {
			const url =
				'https://services.arcgis.com/jIL9msH9OI208GCb/ArcGIS/rest/services/AllHexesFromAgolAsPoints220811a/FeatureServer/22/query';

			const params = {
				where: '1=1',
				geometry: mapPoint,
				geometryType: 'esriGeometryPoint',
				inSR: 4326,
				spatialRelationship: 'intersects',
				distance: 2,
				units: 'esriSRUnit_StatuteMile',
				outSR: 3857,
				f: 'json',
			};

			axios
				.get(url, {
					params,
				})
				.then((response) => {
					response.data.fields ? resolve(true) : resolve(false);
				});
		});
	};

	const queryHub = ({ mapPoint }) => {
		mapPoint ? fireListDisplayToggle(mapPoint) : fireListDisplayToggle();

		goto({ mapPoint });

		currentDroughtQuery({ mapPoint });

		weatherCollection({ mapPoint });
		clearWeatherGrid();
	};

	const getFiresByExtent = ({ extentGeometry }) => {
		const url =
			'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/USA_Wildfires_v1/FeatureServer/0/query';

		const params = {
			where: `1=1`,
			geometry: JSON.stringify(extentGeometry),
			geometryType: 'esriGeometryEnvelope',
			spatialRelationship: 'intersects',
			inSR: 3857,
			returnGeometry: true,
			returnQueryGeometry: true,
			outFields: [
				'IrwinID',
				'IncidentName',
				'POOState',
				'ModifiedOnDateTime',
				'FireDiscoveryDateTime',
				'FireDiscoveryAge',
				'IncidentTypeCategory',
				'CalculatedAcres',
				'DailyAcres',
				'DiscoveryAcres',
				'PercentContained',
				'TotalIncidentPersonnel',
			].join(','),
			f: 'json',
		};
		axios
			.get(url, {
				params,
			})
			.then((response) => {
				const wildFires = response.data.features;
				let fires = wildFires.map((fire) => ({
					fire,
					monthDay: new Date(
						fire.attributes.FireDiscoveryDateTime
					).toLocaleString('default', { month: 'long', day: 'numeric' }),
					sortDate: fire.attributes.FireDiscoveryDateTime,
				}));

				fires = fires.sort((a, b) => {
					let fireOrder = b.sortDate - a.sortDate;

					return fireOrder;
				});

				let groupedFires = {};
				fires.forEach((fireObject) => {
					if (!groupedFires[fireObject.monthDay]) {
						groupedFires[fireObject.monthDay] = [];
					}

					groupedFires[fireObject.monthDay].push(fireObject);
				});

				let dateSorted = [];
				Object.keys(groupedFires).forEach((dateKey) => {
					let dateHeader = `${dateKey}`;
					dateSorted.push(dateHeader);

					groupedFires[dateKey].forEach((data) => {
						data.fire.attributes.DailyAcres = data.fire.attributes.DailyAcres
							? +data.fire.attributes.DailyAcres
							: data.fire.attributes.DiscoveryAcres
							? data.fire.attributes.DiscoveryAcres
							: 'Unreported';
						dateSorted.push([data.fire]);
					});
				});

				sortingOptions({ dateSorted, wildFires });
				firesInView(response.data.features.length);
			})
			.catch((error) => {
				console.error(`query Error: ${error}`);
				firesInView(0);
			});
	};

	const fireItemEvents = () => {
		document.querySelectorAll('.fire-item').forEach((item) => {
			item.addEventListener('mouseenter', (event) => {
				const fireInformation = event.target.attributes.value.value.split(', ');

				fireGraphic({ fireInformation });
			}),
				item.addEventListener('mouseleave', removePreviousFireIcon);

			item.addEventListener('click', (event) => {
				item.removeEventListener('mouseleave', removePreviousFireIcon);

				const fireInformation = event.target.attributes.value.value.split(', ');

				const irwinID = fireInformation[1];

				selectedFireInfoQuery({ irwinID }); //collects the selected fires information and ALSO renders it to the sidebar
			});
		});
	};

	const selectedFireInfoQuery = ({ hitTestResponse, irwinID }) => {
		const url =
			'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/USA_Wildfires_v1/FeatureServer/0/query';

		const irwinIdNumber = hitTestResponse
			? hitTestResponse.IrwinID || hitTestResponse.IRWINID.replace(/[{}]/g, '')
			: irwinID;

		const params = {
			where: `IrwinId ='${irwinIdNumber}'`,
			time: null,
			outFields: [
				'IrwinID',
				'IncidentName',
				'POOState',
				'POOCounty',
				'ModifiedOnDateTime',
				'FireDiscoveryDateTime',
				'FireDiscoveryAge ',
				'IncidentTypeCategory',
				'DailyAcres',
				'TotalIncidentPersonnel',
				'PercentContained',
			].join(','),
			returnGeometry: true,
			outSR: 4326,
			f: 'json',
		};

		axios
			.get(url, {
				params,
			})
			.then((response) => {
				const fireIconGraphicInfo = response.data.features[0];

				const incidentType =
					response.data.features[0].attributes.IncidentTypeCategory !== 'WF'
						? response.data.features[0].attributes.IncidentTypeCategory !== 'RX'
							? 'INCIDENT COMPLEX'
							: 'PERSCRIPTION BURN'
						: 'WILDFIRE';

				const mapPoint = new Point({
					x: response.data.features[0].geometry.x.toFixed(3),
					y: response.data.features[0].geometry.y.toFixed(3),
				});

				const fireData = response.data.features[0]
					? {
							irwinId: response.data.features[0].attributes.IrwinID,
							state: response.data.features[0].attributes.POOState,
							county: response.data.features[0].attributes.POOCounty,
							incidentName: response.data.features[0].attributes.IncidentName,
							fireDiscovery:
								response.data.features[0].attributes.FireDiscoveryAge === 0
									? 'Less than 24 hours'
									: response.data.features[0].attributes.FireDiscoveryAge,
							fireDiscoveryDateTime:
								response.data.features[0].attributes.FireDiscoveryDateTime,
							modifiedOnDateTime:
								response.data.features[0].attributes.ModifiedOnDateTime,
							incidentType: incidentType,
							dailyAcres:
								response.data.features[0].attributes.DailyAcres === null
									? 'Not reported'
									: response.data.features[0].attributes.DailyAcres,
							personnelAssigned: !response.data.features[0].attributes
								.TotalIncidentPersonnel
								? 'Not reported'
								: response.data.features[0].attributes.TotalIncidentPersonnel,
							percentContained:
								response.data.features[0].attributes.PercentContained === null
									? 'Not reported'
									: response.data.features[0].attributes.PercentContained,
					  }
					: {
							irwinId: hitTestResponse.IrwinID,
							incidentName: hitTestResponse.IncidentName,
							fireDiscovery: hitTestResponse.CurrentDateAge,
							fireDiscoveryDateTime: hitTestResponse.CreateDate,
							modifiedOnDateTime: hitTestResponse.DateCurrent,
							incidentType: hitTestResponse.incidentType,
							personnelAssigned:
								DailyAcres === null
									? 'Not reported'
									: response.data.features[0].attributes.TotalIncidentPersonnel,
							percentContained: 'Not reported',
					  };

				setFireContentInfo({ fireData });
				queryHub({ mapPoint });
				populationAndEcologyPerimeterQuery({ irwinIdNumber, mapPoint });
				fireGraphic({ fireIconGraphicInfo });
				updateURLParams({ mapPoint, irwinIdNumber });
			})
			.catch((error) => {
				console.log(error);
			});
	};

	const populationAndEcologyPerimeterQuery = async ({
		irwinIdNumber,
		mapPoint,
	}) => {
		//NOTE: These urls need to be changed from the development link to the production-ready link
		// const devLink =
		// 	'https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/Wildfire_aggregated_v1/FeatureServer/1/query';
		// const productionLink =
		// 	'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/Wildfire_aggregated_v1/FeatureServer/1/query';

		const params = {
			where: `irwinID = '{${irwinIdNumber}}'`,
			inSR: 3857,
			outFields: '*',
			f: 'json',
		};

		axios
			.get(aggregatePerimeterURL, {
				params,
			})
			.then((response) => {
				// console.log('perimeter response', response);
				const consolidatedFirePerimeterData = response.data.fields
					? response.data.features[0].attributes
					: false;

				if (consolidatedFirePerimeterData) {
					const populationData = [
						{
							data: consolidatedFirePerimeterData.sum_estimated0_14pop
								? consolidatedFirePerimeterData.sum_estimated0_14pop
								: 0,
							name: '< 14',
						},
						{
							data: consolidatedFirePerimeterData.sum_estimated15_17pop
								? consolidatedFirePerimeterData.sum_estimated15_17pop
								: 0,
							name: '15-17',
						},
						{
							data: consolidatedFirePerimeterData.sum_estimated18to64pop
								? consolidatedFirePerimeterData.sum_estimated18to64pop
								: 0,
							name: '18-64',
						},
						{
							data: consolidatedFirePerimeterData.sum_estimated65_79pop
								? consolidatedFirePerimeterData.sum_estimated65_79pop
								: 0,
							name: '65-79',
						},
						{
							data: consolidatedFirePerimeterData.sum_estimated80pluspop
								? consolidatedFirePerimeterData.sum_estimated80pluspop
								: 0,
							name: '+ 80',
						},
					];
					const totalDemographyPopulation =
						consolidatedFirePerimeterData.sum_estimated80pluspop +
						consolidatedFirePerimeterData.sum_estimated65_79pop +
						consolidatedFirePerimeterData.sum_estimated18to64pop +
						consolidatedFirePerimeterData.sum_estimated15_17pop +
						consolidatedFirePerimeterData.sum_estimated0_14pop;

					const perimeterPopulationWithVehicle = {
						value: parseFloat(
							100 -
								(consolidatedFirePerimeterData.sum_estpopwith0vehicles /
									consolidatedFirePerimeterData.sum_p0010001) *
									100
						).toFixed(1),
					};
					const perimeterPopulationSpeakingEnglish = {
						value: parseFloat(
							100 -
								(consolidatedFirePerimeterData.sum_estpopnoenglish /
									consolidatedFirePerimeterData.sum_p0010001) *
									100
						).toFixed(1),
					};
					const perimeterWeightedMedianHousing =
						consolidatedFirePerimeterData.sum_weightedmedianhomevalue;
					// Math.round(
					// 	consolidatedFirePerimeterData.sum_weightedmedianhomevalue /
					// 		consolidatedFirePerimeterData.sum_h0010001
					// );

					const perimeterHousingData = {
						TotalHousingUnits: consolidatedFirePerimeterData.sum_h0010001
							? consolidatedFirePerimeterData.sum_h0010001.toLocaleString()
							: null,
						MedianValue:
							consolidatedFirePerimeterData.sum_weightedmedianhomevalue
								? `$${perimeterWeightedMedianHousing.toLocaleString()}`
								: null,
					};

					const perimeterPopulation = {
						totalPopulation: totalDemographyPopulation
							? totalDemographyPopulation.toLocaleString()
							: 0,
						percentofPopulationInPoverty:
							(consolidatedFirePerimeterData.sum_estpopinpoverty =
								consolidatedFirePerimeterData.sum_estpopinpoverty
									? `${parseFloat(
											(consolidatedFirePerimeterData.sum_estpopinpoverty /
												totalDemographyPopulation) *
												100
									  ).toFixed(0)}%`
									: '0%'),
						percentofPopulationWithDisability:
							(consolidatedFirePerimeterData.sum_estpopwithdisability =
								consolidatedFirePerimeterData.sum_estpopwithdisability
									? `${parseFloat(
											(consolidatedFirePerimeterData.sum_estpopwithdisability /
												totalDemographyPopulation) *
												100
									  ).toFixed(0)}%`
									: '0%'),
					};

					//SETTING UP PERIMETER'S ECOLOGY INFORMATION
					const perimeterLandCover = {
						PctBarren: consolidatedFirePerimeterData.PctBarren,
						PctCropland: consolidatedFirePerimeterData.PctCropland,
						PctDevelop: consolidatedFirePerimeterData.PctDevelop,
						PctForest: consolidatedFirePerimeterData.PctForest,
						PctGrass: consolidatedFirePerimeterData.PctGrass,
						PctShrub: consolidatedFirePerimeterData.PctShrub,
						PctSnowIce: consolidatedFirePerimeterData.PctSnowIce,
						PctWater: consolidatedFirePerimeterData.PctWater,
						PctWetlands: consolidatedFirePerimeterData.PctWetlands,
					};

					//modifying CRITHAB information
					consolidatedFirePerimeterData.CritHab = [
						...new Set(consolidatedFirePerimeterData.CritHab.split(', ')),
					].join(', ');

					//modifying OWNERSPADUS information
					consolidatedFirePerimeterData.OwnersPadus
						? (consolidatedFirePerimeterData.OwnersPadus =
								consolidatedFirePerimeterData.OwnersPadus.split(', ')
									.filter(
										(entry) => !entry.includes(undefined) && !entry === false
									)
									.reduce((OwnersPadusObj, OwnersPadusItem) => {
										!OwnersPadusObj[OwnersPadusItem]
											? (OwnersPadusObj[OwnersPadusItem] = 1)
											: OwnersPadusObj[OwnersPadusItem]++;
										return OwnersPadusObj;
									}, {}))
						: null;
					//if there are no keys return a string, otherwise join the array together.
					!consolidatedFirePerimeterData.OwnersPadus[
						Object.keys(consolidatedFirePerimeterData.OwnersPadus)[0]
					]
						? (consolidatedFirePerimeterData.OwnersPadus = null)
						: (consolidatedFirePerimeterData.OwnersPadus = Object.keys(
								consolidatedFirePerimeterData.OwnersPadus
						  )
								.join(', ')
								.split(', '));

					//ForestTypeGroup
					try {
						consolidatedFirePerimeterData.ForestTypeGroup =
							consolidatedFirePerimeterData.ForestTypeGroup.replace(/'/g, '"');
						const consolidatedForestTypeGroup = JSON.parse(
							consolidatedFirePerimeterData.ForestTypeGroup
						);

						consolidatedFirePerimeterData.ForestTypeGroup =
							consolidatedForestTypeGroup;
						consolidatedFirePerimeterData.ForestTypeGroup =
							!consolidatedForestTypeGroup[
								Object.keys(consolidatedForestTypeGroup)[0]
							]
								? (consolidatedFirePerimeterData.ForestTypeGroup = null)
								: (consolidatedFirePerimeterData.ForestTypeGroup = Object.keys(
										consolidatedForestTypeGroup
								  ));
					} catch (error) {
						console.log(error);
					}

					const perimeterEcology = {
						Hex_Count: consolidatedFirePerimeterData.Hex_Count,
						L3EcoReg: consolidatedFirePerimeterData.L3EcoReg
							? consolidatedFirePerimeterData.L3EcoReg
							: 'No information',
						LandForm: consolidatedFirePerimeterData.LandForm
							? consolidatedFirePerimeterData.LandForm
							: 'No information',
						RichClass: consolidatedFirePerimeterData.RichClass
							? consolidatedFirePerimeterData.RichClass
							: null,
						CritHab: consolidatedFirePerimeterData.CritHab
							? consolidatedFirePerimeterData.CritHab
							: null,
						OwnersPadus: consolidatedFirePerimeterData.OwnersPadus
							? consolidatedFirePerimeterData.OwnersPadus
							: null,
						ForestTypeGroup: consolidatedFirePerimeterData.ForestTypeGroup
							? consolidatedFirePerimeterData.ForestTypeGroup
							: null,
						SumCarbon: consolidatedFirePerimeterData.SumCarbon
							? Math.round(consolidatedFirePerimeterData.SumCarbon)
							: null,
					};

					try {
						consolidatedFirePerimeterData.WHPClass =
							consolidatedFirePerimeterData.WHPClass.replace(/'/g, '"');

						const consolidatedWHPClass = JSON.parse(
							consolidatedFirePerimeterData.WHPClass
						);

						consolidatedWHPClass['Very High'] =
							consolidatedWHPClass['Very High'] /
								consolidatedFirePerimeterData.Hex_Count || 0;
						consolidatedWHPClass['High'] =
							consolidatedWHPClass['High'] /
								consolidatedFirePerimeterData.Hex_Count || 0;
						consolidatedWHPClass['Moderate'] =
							consolidatedWHPClass['Moderate'] /
								consolidatedFirePerimeterData.Hex_Count || 0;
						consolidatedWHPClass['Low'] =
							consolidatedWHPClass['Low'] /
								consolidatedFirePerimeterData.Hex_Count || 0;
						consolidatedWHPClass['Very Low'] =
							consolidatedWHPClass['Very Low'] /
								consolidatedFirePerimeterData.Hex_Count || 0;
						formatWildfireRiskData({ consolidatedWHPClass });
					} catch (error) {
						console.error(error);
					}

					populationBarGraph(populationData);
					englishBarGraph(perimeterPopulationSpeakingEnglish);
					vehiclePercentageBar(perimeterPopulationWithVehicle);
					totalPopulationUIRender({ perimeterPopulation });
					housingInfoRender({ perimeterHousingData });
					landCoverDataFormatting({ perimeterLandCover });
					habitatInfoRender({ perimeterEcology });
				} else {
					//If there is no return with that IrwinID, then it must be a fire-point. Not a perimeter.
					populationAndEcologyPointHexQuery({ irwinIdNumber, mapPoint });
				}
			});
	};

	//If the fire does not have a perimeter, get surrounding 2-mile information.
	const populationAndEcologyPointHexQuery = ({ irwinIdNumber, mapPoint }) => {
		addCircleGraphic({ mapPoint });
		newEcoQuery({ mapPoint });
		censusBlockCentroidQuery({ mapPoint });
	};

	const currentDroughtQuery = ({ mapPoint, fireInformation }) => {
		const url =
			'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/US_Drought_Intensity_v1/FeatureServer/3/query';

		const params = {
			where: '1=1',
			geometry: fireInformation
				? `${fireInformation[0]}`
				: `${mapPoint.longitude}, ${mapPoint.latitude}`,
			geometryType: 'esriGeometryPoint',
			inSR: 4326,
			spatialRelationship: 'intersects',
			outFields: 'dm',
			returnQueryGeometry: true,
			f: 'json',
		};

		axios
			.get(url, {
				params,
			})
			.then((response) => {
				const droughtCondition = response.data.features[0]
					? response.data.features[0].attributes.dm
					: 'Drought conditions not reported';

				const droughtStatus = (droughtCondition) => {
					if (droughtCondition === 0) {
						return 'Abnormally dry';
					} else if (droughtCondition === 1) {
						return 'Moderate';
					} else if (droughtCondition === 2) {
						return 'Severe';
					} else if (droughtCondition === 3) {
						return 'Extreme';
					} else if (droughtCondition === 4) {
						return 'Exceptional';
					} else if (droughtCondition === 'Not present') {
						return 'None present';
					}
				};
				renderDroughtStatus(droughtStatus(droughtCondition));
			});
	};

	const weatherCollection = async ({ mapPoint, fireInformation }) => {
		const temp = await temperatureQuery({ mapPoint, fireInformation });
		const wind = await windForecastQuery({ mapPoint, fireInformation });
		const airQualityToday = await currentAirQuality({
			mapPoint,
			fireInformation,
		});
		const airQualityTomorrow = await forecastAirQuality({
			mapPoint,
			fireInformation,
		});

		renderWeatherInformation({
			temp,
			wind,
			airQualityToday,
			airQualityTomorrow,
		});
	};

	const temperatureQuery = async ({ mapPoint, fireInformation }) => {
		return new Promise((resolve) => {
			const url =
				'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/NDFD_DailyTemperature_v1/FeatureServer/1/query';

			const params = {
				where: '1=1',
				geometry: fireInformation
					? `${fireInformation[0]}`
					: `${mapPoint.longitude}, ${mapPoint.latitude}`,
				geometryType: 'esriGeometryPoint',
				inSR: 4326,
				spatialRelationship: 'intersects',
				outFields: ['period', 'temp'].join(','),
				returnQueryGeometry: true,
				f: 'json',
			};

			axios
				.get(url, {
					params,
				})
				.then((response) => {
					if (response.data.fields) {
						const dailyTemperatures = response.data.features.sort((a, b) => {
							a.attributes.Period - b.attributes.Period;
						});
						const temp = {
							todayF: `${dailyTemperatures[2].attributes.Temp}&deg F`,
							tomorrowF: `${dailyTemperatures[1].attributes.Temp}&deg F`,
							todayC: `${Math.round(
								((dailyTemperatures[0].attributes.Temp - 32) * 5) / 9
							)}&deg C`,
							tomorrowC: `${Math.round(
								((dailyTemperatures[1].attributes.Temp - 32) * 5) / 9
							)}&deg C`,
							renderWeather: true,
						};

						resolve(temp);
					} else {
						const temp = {
							todayF: 'No data',
							tomorrowF: 'No data',
							todayC: 'No data',
							tomorrowC: 'No data',
							renderWeather: false,
						};

						resolve(temp);
					}
				})
				.catch((error) => {
					console.error(error);
				});
		});
	};

	const windForecastQuery = async ({ mapPoint, fireInformation }) => {
		return new Promise((resolve) => {
			const url =
				'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/NDFD_WindSpeed_v1/FeatureServer/0/query';

			const params = {
				where: '1=1',
				geometry: fireInformation
					? `${fireInformation[0]}`
					: JSON.stringify(mapPoint),
				geometryType: 'esriGeometryPoint',
				inSR: 4326,
				outFields: ['fromdate', 'todate', 'force', 'label'].join(','),
				returnQueryGeometry: true,
				f: 'json',
			};

			axios
				.get(url, {
					params,
				})
				.then((response) => {
					const windTime = response.data.features.length
						? response.data.features.sort(
								(a, b) => a.attributes.fromdate - b.attributes.fromdate
						  )
						: null;

					const windForce = [
						{
							mph: '< 1mph',
							kph: '< 1km/h',
						},
						{
							mph: '1-3 mph',
							kph: '1-5 km/h',
						},
						{
							mph: '4-7 mph',
							kph: '6-11 km/h',
						},
						{
							mph: '8-12 mph',
							kph: '12-19 km/h',
						},
						{
							mph: '13-17 mph',
							kph: '20-28 km/h',
						},
						{
							mph: '18-24 mph',
							kph: '29-38 km/h',
						},
						{
							mph: '25-30 mph',
							kph: '39-49 km/h',
						},
						{
							mph: '31-38 mph',
							kph: '50-61 km/h',
						},
						{
							mph: '39-46 mph',
							kph: '62-74 km/h',
						},
						{
							mph: '47-54 mph',
							kph: '75-88 km/h',
						},
						{
							mph: '55-63 mph',
							kph: '89-102 km/h',
						},
						{
							mph: '64-72 mph',
							kph: '103-117 km/h',
						},
						{
							mph: '72-82 mph',
							kph: '118-132 km/h',
						},
						{
							mph: '83-92 mph',
							kph: '133-148 km/h',
						},
						{
							mph: '93-103 mph',
							kph: '149-165 km/h',
						},
						{
							mph: '104-114 mph',
							kph: '166-183 km/h',
						},
						{
							mph: '115-125 mph',
							kph: '184-200 km/h',
						},
						{
							mph: 'No data',
							kph: 'No data',
						},
					];

					const wind = windTime
						? {
								today: windForce[windTime[0].attributes.force],
								tomorrow: windForce[windTime[8].attributes.force],
						  }
						: {
								today: windForce[17],
								tomorrow: windForce[17],
						  };

					resolve(wind);
				})
				.catch((error) => {
					console.error(error);
				});
		});
	};

	const currentAirQuality = ({ mapPoint, fireInformation }) => {
		return new Promise((resolve) => {
			const url =
				'https://services.arcgis.com/cJ9YHowT8TU7DUyn/ArcGIS/rest/services/AirNowAQIForecast/FeatureServer/0/query';

			const params = {
				where: '1=1',
				geometry: fireInformation
					? `${fireInformation[0]}`
					: JSON.stringify(mapPoint),
				geometryType: 'esriGeometryPoint',
				inSR: 4326,
				outFields: 'gridcode',
				returnQueryGeometry: true,
				f: 'json',
			};

			axios
				.get(url, {
					params,
				})
				.then((response) => {
					const currentAQICode = response.data.features[0]
						? response.data.features[0].attributes.gridcode
						: 'No data';

					const airQualityToday = (currentAQICode) => {
						if (currentAQICode === 1) {
							return 'Good';
						} else if (currentAQICode === 2) {
							return 'Moderate';
						} else if (currentAQICode === 3) {
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
				});
		});
	};

	const forecastAirQuality = ({ mapPoint, fireInformation }) => {
		return new Promise((resolve) => {
			const url =
				'https://services.arcgis.com/cJ9YHowT8TU7DUyn/ArcGIS/rest/services/AirNowAQIForecast/FeatureServer/1/query';

			const params = {
				where: '1=1',
				geometry: fireInformation
					? `${fireInformation[0]}`
					: JSON.stringify(mapPoint),
				geometryType: 'esriGeometryPoint',
				inSR: 4326,
				outFields: 'gridcode',
				returnQueryGeometry: true,
				f: 'json',
			};

			axios
				.get(url, {
					params,
				})
				.then((response) => {
					const airQualityForecast = response.data.features[0]
						? response.data.features[0].attributes.gridcode
						: 'No data';

					const airQualityTomorrow = (airQualityForecast) => {
						if (airQualityForecast === 1) {
							return 'Good';
						} else if (airQualityForecast === 2) {
							return 'Moderate';
						} else if (airQualityForecast === 3) {
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

					resolve(airQualityTomorrow(airQualityForecast));
				})
				.catch((error) => {
					console.error(error);
				});
		});
	};

	const censusBlockCentroidQuery = ({ mapPoint, fireInformation }) => {
		const params = {
			where: '1=1',
			geometry: fireInformation
				? `${fireInformation[0]}`
				: JSON.stringify(mapPoint),
			geometryType: 'esriGeometryPoint',
			spatialRelationship: 'intersects',
			distance: 2,
			units: 'esriSRUnit_StatuteMile',
			inSR: 4326,
			outFields: [
				'P0010001',
				'Estimated0_14Pop',
				'Estimated15_17Pop',
				'Estimated18to64Pop',
				'Estimated65_79Pop',
				'Estimated80PlusPop',
				'EstPopWithDisability',
				'EstPopinPoverty',
				'EstPopNoEnglish',
				'EstPopWith0Vehicles',
				'H0010001',
				'MedHomeValueWeighted',
			].join(','),
			returnGeometry: true,
			returnQueryGeometry: true,
			f: 'json',
		};

		axios
			.get(populatedBlockCentroidsURL, {
				params,
			})
			.then((response) => {
				console.log(response);
				if (response.data.features) {
					// console.log('fire point incident response', response.data.features);
					const aggregatedPopulationBlockObject = response.data.features.reduce(
						(a, b) => {
							Object.keys(b.attributes).forEach((key) => {
								a[key] = (a[key] || 0) + b.attributes[key];
							}),
								0;
							return a;
						},
						{}
					);

					const populationData = [
						{
							data: aggregatedPopulationBlockObject.Estimated0_14Pop,
							name: '< 14',
						},
						{
							data: aggregatedPopulationBlockObject.Estimated15_17Pop,
							name: '15-17',
						},
						{
							data: aggregatedPopulationBlockObject.Estimated18to64Pop,
							name: '18-64',
						},
						{
							data: aggregatedPopulationBlockObject.Estimated65_79Pop,
							name: '65-79',
						},
						{
							data: aggregatedPopulationBlockObject.Estimated80PlusPop,
							name: '+ 80',
						},
					];

					const totalDemographyPopulation =
						aggregatedPopulationBlockObject.Estimated80PlusPop +
						aggregatedPopulationBlockObject.Estimated65_79Pop +
						aggregatedPopulationBlockObject.Estimated18to64Pop +
						aggregatedPopulationBlockObject.Estimated15_17Pop +
						aggregatedPopulationBlockObject.Estimated0_14Pop;

					const englishSpeakingPopulation = {
						value: parseFloat(
							100 -
								(aggregatedPopulationBlockObject.EstPopNoEnglish /
									totalDemographyPopulation) *
									100
						).toFixed(1),
					};
					const populationWithVehicle = {
						value: parseFloat(
							100 -
								(aggregatedPopulationBlockObject.EstPopWith0Vehicles /
									totalDemographyPopulation) *
									100
						).toFixed(1),
					};

					const weightedMedianHomeValue = Math.round(
						aggregatedPopulationBlockObject.WeightedMedianHomeValue /
							aggregatedPopulationBlockObject.P0010001
					);
					// console.log(aggregatedPopulationBlockObject.WeightedMedianHomeValue);
					// console.log(aggregatedPopulationBlockObject.H0010001);
					// console.log(weightedMedianHomeValue);

					const radiusHousingData = {
						TotalHousingUnits: aggregatedPopulationBlockObject.H0010001
							? aggregatedPopulationBlockObject.H0010001.toLocaleString()
							: null,
						MedianValue: aggregatedPopulationBlockObject.WeightedMedianHomeValue
							? `$${weightedMedianHomeValue.toLocaleString()}`
							: null,
					};
					const totalRadiusPopulation = {
						totalPopulation: totalDemographyPopulation
							? totalDemographyPopulation.toLocaleString()
							: 0,
						percentofPopulationInPoverty:
							aggregatedPopulationBlockObject.EstPopinPoverty
								? `${parseFloat(
										(aggregatedPopulationBlockObject.EstPopinPoverty /
											totalDemographyPopulation) *
											100
								  ).toFixed(0)}%`
								: '0%',
						percentofPopulationWithDisability:
							aggregatedPopulationBlockObject.EstPopWithDisability
								? `${parseFloat(
										(aggregatedPopulationBlockObject.EstPopWithDisability /
											totalDemographyPopulation) *
											100
								  ).toFixed(0)}%`
								: '0%',
					};

					populationBarGraph(populationData);
					englishBarGraph(englishSpeakingPopulation);
					vehiclePercentageBar(populationWithVehicle);
					totalPopulationUIRender({ totalRadiusPopulation });
					housingInfoRender({ radiusHousingData });
				} else {
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
						WeightedMedianHomeValue: 0,
					};
				}
			});
	};

	//NEW ECO QUERY
	const newEcoQuery = ({ mapPoint, fireInformation }) => {
		const url =
			'https://services.arcgis.com/jIL9msH9OI208GCb/ArcGIS/rest/services/AllHexesFromAgolAsPoints220823a/FeatureServer/0/query';

		const params = {
			where: '1=1',
			geometry: fireInformation
				? `${fireInformation[0]}`
				: JSON.stringify(mapPoint),
			geometryType: 'esriGeometryPoint',
			inSR: 4326,
			spatialRelationship: 'intersects',
			distance: 2,
			units: 'esriSRUnit_StatuteMile',
			outFields: [
				'L3EcoReg',
				'LandForm',
				'CritHab',
				'OwnersPadus',
				'RichClass',
				'WHPClass',
				'PctWater',
				'PctSnowIce',
				'PctDevelop',
				'PctBarren',
				'PctForest',
				'PctShrub',
				'PctGrass',
				'PctCropland',
				'PctWetlands',
				'SumCarbon',
				'ForestTypeGroup  ',
			].join(','),
			returnGeometry: true,
			returnQueryGeometry: true,
			outSR: 3857,
			f: 'json',
		};

		axios
			.get(url, {
				params,
			})
			.then((response) => {
				const ecoResponse = response.data.features;

				if (response.data.fields) {
					const aggregateEcoObj = ecoResponse.reduce((a, b) => {
						Object.keys(b.attributes).forEach((key) => {
							if (
								typeof b.attributes[key] === 'string' ||
								typeof b.attributes[key] === 'object'
							) {
								a[key] = a[key] + ', ' || '' + b.attributes[key];
							}

							a[key] = (a[key] || 0) + b.attributes[key];
						});
						return a;
					}, {});

					//Creating a list from from the CritHabitat obj. Taking only the keys listed.
					aggregateEcoObj.CritHab
						? (aggregateEcoObj.CritHab = aggregateEcoObj.CritHab.split(', ')
								.filter(
									(entry) => !entry.includes(undefined) && !entry === false
								)
								.reduce((CritHabObj, CritHabItem) => {
									!CritHabObj[CritHabItem]
										? (CritHabObj[CritHabItem] = 1)
										: CritHabObj[CritHabItem]++;
									return CritHabObj;
								}, {}))
						: null;
					//if there are no keys return a string, otherwise join the array together.
					!aggregateEcoObj.CritHab[Object.keys(aggregateEcoObj.CritHab)]
						? (aggregateEcoObj.CritHab = null)
						: (aggregateEcoObj.CritHab = Object.keys(
								aggregateEcoObj.CritHab
						  ).join(', '));

					//Creating an object of EcoRegion entries and their 'count' value from an array
					aggregateEcoObj.L3EcoReg
						? (aggregateEcoObj.L3EcoReg = aggregateEcoObj.L3EcoReg.split(', ')
								.filter((entry) => !entry.includes(undefined))
								.reduce((L3EcoRegObj, L3EcoRegItem) => {
									!L3EcoRegObj[L3EcoRegItem]
										? (L3EcoRegObj[L3EcoRegItem] = 1)
										: L3EcoRegObj[L3EcoRegItem]++;
									return L3EcoRegObj;
								}, {}))
						: null;
					!aggregateEcoObj.L3EcoReg[Object.keys(aggregateEcoObj.L3EcoReg)[0]]
						? (aggregateEcoObj.L3EcoReg = null)
						: (aggregateEcoObj.L3EcoReg = Object.entries(
								aggregateEcoObj.L3EcoReg
						  )
								.sort((a, b) => b[0].localeCompare(a[0]))
								.sort((a, b) => b[1] - a[1])[0][0]);

					aggregateEcoObj.LandForm
						? (aggregateEcoObj.LandForm = aggregateEcoObj.LandForm.split(', ')
								.filter((entry) => !entry.includes(undefined))
								.reduce((landformObj, landformItem) => {
									!landformObj[landformItem]
										? (landformObj[landformItem] = 1)
										: landformObj[landformItem]++;
									return landformObj;
								}, {}))
						: null;

					!aggregateEcoObj.LandForm[Object.keys(aggregateEcoObj.LandForm)[0]]
						? (aggregateEcoObj.LandForm = null)
						: (aggregateEcoObj.LandForm = Object.entries(
								aggregateEcoObj.LandForm
						  )
								.sort((a, b) => b[0].localeCompare(a[0]))
								.sort((a, b) => b[1] - a[1])[0][0]);

					//Creating an object of ForestType entries and their 'count' value from an array
					aggregateEcoObj.ForestTypeGroup
						? (aggregateEcoObj.ForestTypeGroup =
								aggregateEcoObj.ForestTypeGroup.split(',')
									.filter(
										(entry) =>
											!entry.includes(undefined) && !entry.includes(null)
									)
									.reduce((ForestTypeGroupObj, ForestTypeGroupItem) => {
										!ForestTypeGroupObj[ForestTypeGroupItem]
											? (ForestTypeGroupObj[ForestTypeGroupItem] = 1)
											: ForestTypeGroupObj[ForestTypeGroupItem]++;
										return ForestTypeGroupObj;
									}, {}))
						: null;
					!aggregateEcoObj.ForestTypeGroup[
						Object.keys(aggregateEcoObj.ForestTypeGroup)[0]
					]
						? (aggregateEcoObj.ForestTypeGroup = null)
						: (aggregateEcoObj.ForestTypeGroup = Object.entries(
								aggregateEcoObj.ForestTypeGroup
						  )
								.sort((a, b) => b[0].localeCompare(a[0]))
								.sort((a, b) => b[1] - a[1])
								.map((treeType) => treeType[0]));

					aggregateEcoObj.OwnersPadus
						? (aggregateEcoObj.OwnersPadus = aggregateEcoObj.OwnersPadus.split(
								', '
						  )
								.filter(
									(entry) => !entry.includes(undefined) && !entry === false
								)
								.reduce((OwnersPadusObj, OwnersPadusItem) => {
									!OwnersPadusObj[OwnersPadusItem]
										? (OwnersPadusObj[OwnersPadusItem] = 1)
										: OwnersPadusObj[OwnersPadusItem]++;
									return OwnersPadusObj;
								}, {}))
						: null;
					!aggregateEcoObj.OwnersPadus[
						Object.keys(aggregateEcoObj.OwnersPadus)[0]
					]
						? (aggregateEcoObj.OwnersPadus = null)
						: (aggregateEcoObj.OwnersPadus = Object.keys(
								aggregateEcoObj.OwnersPadus
						  )
								.join(', ')
								.split(', '));

					//creating the Biodeversity richness class from the return object
					aggregateEcoObj.RichClass
						? (aggregateEcoObj.RichClass = aggregateEcoObj.RichClass.split(', ')
								.filter(
									(entry) => !entry.includes(undefined) && !entry.includes(null)
								)
								.reduce((RichClassObj, RichClassItem) => {
									!RichClassObj[RichClassItem]
										? (RichClassObj[RichClassItem] = 1)
										: RichClassObj[RichClassItem]++;
									return RichClassObj;
								}, {}))
						: null;
					!aggregateEcoObj.RichClass[Object.keys(aggregateEcoObj.RichClass)[0]]
						? (aggregateEcoObj.RichClass = null)
						: (aggregateEcoObj.RichClass = Object.entries(
								aggregateEcoObj.RichClass
						  )
								.sort((a, b) => b[0].localeCompare(a[0]))
								.sort((a, b) => b[1] - a[1])[0][0]);

					//Sum of the carbon data for each hex-point
					aggregateEcoObj.SumCarbon =
						aggregateEcoObj.SumCarbon !== null
							? Math.round(aggregateEcoObj.SumCarbon)
							: 0;

					//creating the WFHP object from the returned object
					aggregateEcoObj.WHPClass
						? (aggregateEcoObj.WHPClass = aggregateEcoObj.WHPClass.split(', ')
								.filter((entry) => !entry.includes(undefined))
								.reduce((WHPClassObj, WHPClassItem) => {
									!WHPClassObj[WHPClassItem]
										? (WHPClassObj[WHPClassItem] = 1)
										: WHPClassObj[WHPClassItem]++;
									return WHPClassObj;
								}, {}))
						: null;

					//Adjusting the percentages
					aggregateEcoObj.PctBarren =
						aggregateEcoObj.PctBarren / ecoResponse.length;
					aggregateEcoObj.PctCropland =
						aggregateEcoObj.PctCropland / ecoResponse.length;
					aggregateEcoObj.PctDevelop =
						aggregateEcoObj.PctDevelop / ecoResponse.length;
					aggregateEcoObj.PctForest =
						aggregateEcoObj.PctForest / ecoResponse.length;
					aggregateEcoObj.PctGrass =
						aggregateEcoObj.PctGrass / ecoResponse.length;
					aggregateEcoObj.PctShrub =
						aggregateEcoObj.PctShrub / ecoResponse.length;
					aggregateEcoObj.PctSnowIce =
						aggregateEcoObj.PctSnowIce / ecoResponse.length;
					aggregateEcoObj.PctWater =
						aggregateEcoObj.PctWater / ecoResponse.length;
					aggregateEcoObj.PctWetlands =
						aggregateEcoObj.PctWetlands / ecoResponse.length;

					//Sorting the WF risk potential.
					if (aggregateEcoObj.WHPClass) {
						aggregateEcoObj.WHPClass['Very High'] =
							aggregateEcoObj.WHPClass['Very High'] / ecoResponse.length || 0;
						aggregateEcoObj.WHPClass['High'] =
							aggregateEcoObj.WHPClass['High'] / ecoResponse.length || 0;
						aggregateEcoObj.WHPClass['Moderate'] =
							aggregateEcoObj.WHPClass['Moderate'] / ecoResponse.length || 0;
						aggregateEcoObj.WHPClass['Low'] =
							aggregateEcoObj.WHPClass['Low'] / ecoResponse.length || 0;
						aggregateEcoObj.WHPClass['Very Low'] =
							aggregateEcoObj.WHPClass['Very Low'] / ecoResponse.length || 0;
					}

					//creating a 'Hex_Count' Key base on the number of hexes queried.
					aggregateEcoObj.Hex_Count = ecoResponse.length;

					formatWildfireRiskData({ aggregateEcoObj });
					landCoverDataFormatting({ aggregateEcoObj });
					habitatInfoRender({ aggregateEcoObj });
				} else {
					const aggregateEcoObj = {
						Hex_Count: null,
						CritHab: null,
						L3EcoReg: null,
						LandForm: null,
						OwnersPadus: null,
						RichClass: null,
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
							High: 0,
							Moderate: 0,
							Low: 0,
							'Very Low': 0,
						},
					};
					habitatInfoRender({ aggregateEcoObj });
					landCoverDataFormatting({ aggregateEcoObj });
					formatWildfireRiskData({ aggregateEcoObj });
				}
			});
	};

	//DATA VIZ
	//Landcover piechart
	const landCoverDataFormatting = ({ aggregateEcoObj, perimeterLandCover }) => {
		const landCoverArray = [
			{
				name: 'Forest',
				percent: aggregateEcoObj
					? aggregateEcoObj['PctForest']
					: perimeterLandCover['PctForest'],
				fill: '#005948',
			},
			{
				name: 'Barren',
				percent: aggregateEcoObj
					? aggregateEcoObj['PctBarren']
					: perimeterLandCover['PctBarren'],
				fill: '#6E726B',
			},
			{
				name: 'Cropland',
				percent: aggregateEcoObj
					? aggregateEcoObj['PctCropland']
					: perimeterLandCover['PctCropland'],
				fill: '#D3AA5F',
			},
			{
				name: 'Developed',
				percent: aggregateEcoObj
					? aggregateEcoObj['PctDevelop']
					: perimeterLandCover['PctDevelop'],
				fill: '#993131',
			},
			{
				name: 'Grassland',
				percent: aggregateEcoObj
					? aggregateEcoObj['PctGrass']
					: perimeterLandCover['PctGrass'],
				fill: '#918652',
			},
			{
				name: 'Scrubland',
				percent: aggregateEcoObj
					? aggregateEcoObj['PctShrub']
					: perimeterLandCover['PctShrub'],
				fill: '#4F482A',
			},
			{
				name: 'Snow / Ice',
				percent: aggregateEcoObj
					? aggregateEcoObj['PctSnowIce']
					: perimeterLandCover['PctSnowIce'],
				fill: '#EDEDEB',
			},
			{
				name: 'Water',
				percent: aggregateEcoObj
					? aggregateEcoObj['PctWater']
					: perimeterLandCover['PctWater'],
				fill: '#054F8C',
			},
			{
				name: 'Wetlands',
				percent: aggregateEcoObj
					? aggregateEcoObj['PctWetlands']
					: perimeterLandCover['PctWetlands'],
				fill: '#028B9C',
			},
		];
		let placeholderPercent = 0;

		landCoverArray.map((biome) => {
			biome.percent = Math.round(biome.percent);

			if (biome.percent < 10) {
				placeholderPercent += biome.percent;

				biome.percent = 0;
			}
		});

		const otherPercent = {
			name: 'Other',
			percent: parseFloat(placeholderPercent.toFixed(0)),
			fill: '#D9C7AE',
		};
		landCoverArray.push(otherPercent);

		renderLandCoverGraph(landCoverArray);
	};

	const renderLandCoverGraph = (landCoverArray) => {
		d3.select('#landcover-graph').remove();

		const landCoverArrayData = landCoverArray.filter((entry) => entry.percent);

		if (landCoverArrayData.length === 0) {
			return;
		}

		const colorScheme = d3
			.scaleOrdinal()
			.domain(landCoverArrayData)
			.range([
				'#005948',
				'#6E726B',
				'#D3AA5F',
				'#993131',
				'#918652',
				'#4F482A',
				'#EDEDEB',
				'#028B9C',
				'#054F8C',
				'#D9C7AE',
			]);

		const svg = d3
			.select('#landcover-chart')
			.append('div')
			.attr('id', 'landcover-graph')
			.append('div')
			.style('position', 'relative')
			.append('svg')
			.attr('height', 200)
			.attr('width', 320)
			.style('display', 'block')
			.style('margin', '20px auto')
			.attr('id', 'landcover-svg');

		const svgBackground = d3
			.select('#landcover-graph div')
			.insert('div', 'svg')
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
			width = landcoverSVG.attr('width'),
			height = landcoverSVG.attr('height'),
			radius = Math.min(width, height) / 2;

		const g = landcoverSVG
			.append('g')
			.attr('transform', `translate(${width / 2}, ${height / 2})`);

		const text = landcoverSVG
			.append('g')
			.attr('transform', `translate(${width / 2}, ${height / 2})`);

		const pie = d3.pie().value((d) => d.percent);

		const pieArc = d3
			.arc()
			.outerRadius(radius * 1.0)
			.innerRadius(radius * 0.7);

		const piePiece = g.selectAll('arc').data(pie(landCoverArrayData)).enter();

		piePiece
			.append('path')
			.attr('d', pieArc)
			.attr('fill', (d) => d.data.fill)
			//text appears while hovering over corresponding doughtnut
			.on('mouseover', (e, d, i) => {
				text
					.append('text')
					.attr('dy', '1em')
					.attr('text-anchor', 'middle')
					.attr('class', 'percentage')
					.text(`${d.value}%`);
				text
					.append('text')
					.attr('text-anchor', 'middle')
					.attr('class', 'landcover')
					.text(`${d.data.name}`);
			})
			.on('mouseout', () => {
				text.select('.percentage').remove();
				text.select('.landcover').remove();
			});
	};

	//FIRE CONTAINMENT BAR
	const containmentBar = (containment) => {
		d3.select('#containment-bar').remove();

		if (containment === 'Not reported') {
			document.getElementById(
				'containment-text'
			).innerHTML = `<h4 class = "bold trailer-0">${containment}</h4>`;
		} else {
			const data = [100.01, containment];

			const barColors = d3
				.scaleOrdinal()
				.domain(data)
				.range(['#032235', '#FFBA1F']);

			const SVGcontainer = d3
				.select('#containment')
				.append('div')
				.attr('id', 'svgContainer')
				.attr('width', 100)
				.attr('height', 100);

			const height = 60;
			const width = 185;

			const barSVG = d3
				.select('#svgContainer')
				.append('svg')
				.attr('class', 'bar')
				.attr('id', 'containment-bar')
				.style('margin', '0px -14px 0')
				.style('padding', '6px 10px 0px')
				.attr('width', '100%')
				.attr('height', '85%')
				.attr('viewBox', `0 0 181 40`)
				.append('g')
				.attr('transform', 'translate( 0, -1.5 )');

			const statusBar = d3
				.scaleLinear()
				.domain([0, d3.max(data)])
				.range([0, width - 30]);

			barSVG
				.selectAll('rect')
				.data(data)
				.enter()
				.append('rect')
				.attr('width', statusBar)
				.attr('height', 20)
				.attr('fill', (d) => barColors(d))
				.attr('dy', '0.1');

			barSVG
				.append('text')
				.attr('dy', '2em')
				.attr('dx', '1.5em')
				.attr('x', containment * ((width - 35) / 100))
				.attr('text-anchor', 'end')
				.attr('fill', '#ffb600')
				.style('font-size', '1.3rem')
				.style('font-weight', 'bold')
				.text(`${containment}%`);
		}
	};

	//Population Bar Chart
	const populationBarGraph = (populationData) => {
		const populationDataValue = populationData.reduce((a, b) => a + b.data, 0);

		const originalWidth = 220;
		const originalHeight = 135;
		const margin = {
			top: 15,
			right: 10,
			left: 20,
			bottom: 20,
		};

		//clear out the existing chart
		d3.select('#population-graph').remove();
		document.querySelector('#population-graph-data-control').innerText = '';

		if (!populationDataValue) {
			document.querySelector('#population-graph-label').innerHTML = '';

			return;
		}

		d3.select('#population-breakdown')
			.append('div', 'div')
			.attr('id', 'population-graph')
			.style('width', `100%`)
			.style('height', `100%`)
			.append('svg')
			.attr('id', 'population-svg');

		//set up the svg container
		const svg = d3
			.select('#population-svg')
			.attr('height', '100%')
			.attr('width', '100%')
			.attr('viewBox', '0 -28 220 188')
			.attr('preserveAspectRatio', 'xMidYMax')
			.append('g')
			.attr('transform', 'translate( 0, 0 )');

		const g = svg.append('g');

		//set up the Scales
		const xScale = d3
			.scaleBand()
			.domain(populationData.map((d, i) => d.name))
			.range([0, originalWidth])
			.padding(0.2);

		const yScale = d3
			.scaleLinear()
			.domain([0, d3.max(populationData, (d) => d.data)])
			.range([originalHeight, 0]);

		//set up the axes
		const xAxis = d3.axisBottom(xScale);
		const yAxis = d3.axisLeft(yScale);

		g.call(xAxis).attr('transform', `translate(0, ${originalHeight})`);

		//set up the svg data
		svg
			.selectAll('.bar')
			.data(populationData)
			.enter()
			.append('rect')
			.attr('class', 'rect-bar')
			.attr('x', (d, i) => xScale(d.name, i))
			.attr('y', (d) => (d.data === 0 ? yScale(0.1) : yScale(d.data)))
			.attr('width', xScale.bandwidth())
			.attr('height', (d) =>
				d.data === 0
					? originalHeight - yScale(0.1)
					: originalHeight - yScale(d.data)
			)
			.attr('fill', '#0285a8')
			.on('mouseover', (e, d) => {
				svg
					.append('text')
					.attr('class', 'pop')
					.attr('x', xScale(d.name))
					.attr('y', d.data === 0 ? yScale(0.1) : yScale(d.data))
					.attr('dy', '-0.5em')
					.attr('dx', `${d.data < 10 ? '0.7em' : '0.25em'}`)
					.attr('transform', `translate(${d.data > 999 ? -6 : 0}, 0)`)
					.attr('fill', '#ffb600')
					.style('font-weight', 'bold')
					.text(d.data.toLocaleString());
			})
			.on('mouseout', () => {
				svg.select('.pop').remove();
			});

		//adding formating to the surinding
		document.querySelector('#population-graph-spacer').innerHTML = '';
		document.querySelector('#population-graph-label').innerHTML = '';

		document
			.querySelector('#population-graph-spacer')
			.setAttribute('style', 'width: 25%;');

		document
			.querySelector('#population-graph-label')
			.setAttribute(
				'style',
				'text-align: center; font-size: 0.875rem; margin: 0 auto; width: 75%;'
			);
		document.querySelector(
			'#population-graph-label'
		).innerHTML = `AGE IN YEARS`;
	};

	//english speaking population
	const englishBarGraph = (englishSpeakingPopulation) => {
		d3.select('#english-percent-bar').remove();

		d3.select('#english-pop-header', 'text').remove();

		if (englishSpeakingPopulation.value === 'NaN') {
			return;
		}

		const range = 350;
		const height = 55;
		const width = 350;

		const margin = {
			top: 0,
			right: 10,
			left: 10,
			bottom: 10,
		};

		d3.select('#english-pop-percentage')
			.insert('div', 'div')
			.attr('id', 'english-percent-bar')
			.attr('width', '100%')
			.attr('height', '100%')
			.append('svg')
			.attr('id', 'english-speaking-svg');

		const data = [100.01, englishSpeakingPopulation.value];
		const barText = data[1] === '100.0' ? `100%` : `${data[1]}%`;

		const barColors = d3
			.scaleOrdinal()
			.domain(data)
			.range(['#032235', '#0285a8']);

		const barSVG = d3
			.select('#english-speaking-svg')
			.attr('class', 'bar')
			.attr('width', '100%')
			.attr('height', '100%')
			.attr('viewBox', `0 0 ${width} 65`)
			.attr('preserveAspectRatio', 'none');

		const g = barSVG
			.append('g')
			.attr('transform', `translate(${width / 2}, ${height / 2})`);

		const percentBar = d3
			.scaleLinear()
			.domain([0, d3.max(data)])
			.range([0, range]);

		barSVG
			.selectAll('rect')
			.data(data)
			.enter()
			.append('rect')
			.attr('width', percentBar)
			.attr('height', 30.01)
			.attr('fill', (d) => barColors(d));

		barSVG
			.append('text')
			.attr('dy', '1.4em')
			.attr('dx', '1.5em')
			.attr('x', range / 2)
			.attr('text-anchor', 'end')
			.style('fill', `${barText.length > 6 ? '#07698C' : 'white'}`)
			.style('font-weight', 'bold')
			.text(barText);

		g.insert('text')
			.attr('id', 'english-pop-header')
			.attr('dy', '1.7em')
			.attr('text-anchor', 'middle')
			.text('SPEAKS ENGLISH')
			.attr('fill', '#efefef');
	};

	//Population that has a vehicle
	const vehiclePercentageBar = (populationWithVehicle) => {
		d3.select('#vehicle-percent-bar').remove();

		d3.select('#vehicle-pop-header').remove();

		if (populationWithVehicle.value === 'NaN') {
			return;
		}
		const range = 350;
		const height = 55;
		const width = 350;

		const margin = {
			top: 0,
			right: 10,
			left: 10,
			bottom: 10,
		};

		d3.select('#vehicle-pop-percentage')
			.insert('div', 'div')
			.attr('id', 'vehicle-percent-bar')
			.attr('width', '100%')
			.attr('height', '100%')
			.append('svg')
			.attr('id', 'vehicle-svg');

		const data = [100.01, populationWithVehicle.value];
		const barText = data[1] === '100.0' ? `100%` : `${data[1]}%`;

		const barColors = d3
			.scaleOrdinal()
			.domain(data)
			.range(['#032235', '#0285a8']);

		const barSVG = d3
			.select('#vehicle-svg')
			.attr('class', 'bar')
			.attr('width', '100%')
			.attr('height', '100%')
			.attr('viewBox', `0 0 ${width} ${height}`)
			.attr('preserveAspectRatio', 'none');

		const g = barSVG
			.append('g')
			.attr('transform', `translate(${width / 2}, ${height / 2})`);

		const percentBar = d3
			.scaleLinear()
			.domain([0, d3.max(data)])
			.range([0, range]);

		barSVG
			.selectAll('rect')
			.data(data)
			.enter()
			.append('rect')
			.attr('width', percentBar)
			.attr('height', 30.01)
			.attr('fill', (d) => barColors(d));

		barSVG
			.append('text')
			.attr('dy', '1.4em')
			.attr('dx', '1.5em')
			.attr('x', range / 2)
			.attr('text-anchor', 'end')
			.style('fill', `${barText.length > 6 ? '#07698C' : 'white'}`)
			.style('font-weight', 'bold')
			.text(barText);

		g.insert('text')
			.attr('id', 'vehicle-pop-header')
			.attr('dy', '1.7em')
			.attr('text-anchor', 'middle')
			.text('HAS VEHICLE')
			.attr('fill', '#efefef');
	};

	//WILDFIRE HAZARD POTENTIAL BAR GRAPH

	const formatWildfireRiskData = ({
		aggregateEcoObj,
		consolidatedWHPClass,
	}) => {
		const wildfireRiskData = [
			{
				name: 'VERY HIGH',
				value: aggregateEcoObj
					? aggregateEcoObj.WHPClass['Very High']
					: consolidatedWHPClass['Very High'],
			},
			{
				name: 'HIGH',
				value: aggregateEcoObj
					? aggregateEcoObj.WHPClass['High']
					: consolidatedWHPClass['High'],
			},
			{
				name: 'MODERATE',
				value: aggregateEcoObj
					? aggregateEcoObj.WHPClass['Moderate']
					: consolidatedWHPClass['Moderate'],
			},
			{
				name: 'LOW',
				value: aggregateEcoObj
					? aggregateEcoObj.WHPClass['Low']
					: consolidatedWHPClass['Low'],
			},
			{
				name: 'VERY LOW',
				value: aggregateEcoObj
					? aggregateEcoObj.WHPClass['Very Low']
					: consolidatedWHPClass['Very Low'],
			},
		];

		wildfirePotentialGraph({ wildfireRiskData });
	};

	const wildfirePotentialGraph = ({ wildfireRiskData }) => {
		const data = wildfireRiskData;

		//clear out the existing chart
		d3.select('#wildfire-risk-graph').remove();
		document.querySelector('#wildfire-risk-data-control').innerText = ``;

		if (data.reduce((a, b) => a + b.value, 0) === 0) {
			document.querySelector('#wildfire-risk-data-control').innerText = ``;
			document.querySelector('#wildfire-risk-header').innerText = ``;
			return;
		}

		const width = 340;
		const height = 170;
		const margin = {
			top: 15,
			right: 5,
			left: 45,
			bottom: 10,
		};

		const innerHeight = height - margin.top - margin.bottom;

		d3.select('#wildfire-risk')
			.append('div', 'div')
			.attr('id', 'wildfire-risk-graph')
			.attr('width', '100%')
			.attr('height', '100%')
			.append('svg')
			.attr('id', 'wildfire-risk-graph-svg')
			.attr('transform', `translate(0, 0)`);

		const barColors = d3
			.scaleOrdinal()
			.domain(data)
			.range(['#993131', '#B6673E', '#D3AA5F', '#C1B999', '#707767']);

		//set up the svg container
		const svg = d3
			.select('#wildfire-risk-graph-svg')
			.attr('height', '100%')
			.attr('width', '100%')
			.attr('viewBox', `-45 0 ${width} ${height}`)
			.attr('preserveAspectRatio', 'none')
			.style('overflow', 'visible');

		//set up the group for the barGraph
		const g = svg
			.append('g')
			.attr('transform', `translate(${margin.left}, ${margin.top})`);

		//formating the scale and data source for the axes
		const xScale = d3
			.scaleLinear()
			.domain([0, d3.max(data, (d) => d.value)])
			.range([0, width]);

		const yScale = d3
			.scaleBand()
			.domain(data.map((d) => d.name))
			.range([0, innerHeight])
			.padding(-0.1);

		//assigning the scales(and data) to the axes
		const xAxis = d3.axisBottom(xScale);
		const yAxis = d3.axisLeft(yScale);

		g.append('g').call(yAxis).selectAll('.domain, .tick line').remove();

		const xAxisG = g
			.append('g')
			.call(xAxis)
			.attr('transform', `translate(0, ${height})`);

		xAxisG.selectAll('.domain, .tick').remove();

		svg
			.selectAll('.bar')
			.data(data)
			.enter()
			.append('g')
			.attr('transform', `translate(${margin.left}, 22)`)
			.append('rect')
			.attr('class', 'fire-rect-bar')
			.attr('y', (d, i) => yScale(d.name, i))
			.attr('width', (d) => (d.value > 0 ? d.value * 200 : 0.02 * 200))
			.attr('height', '20px')
			.attr('fill', (d) => barColors(d.name));

		svg
			.selectAll('.bar')
			.data(data)
			.enter()
			.append('text')
			.attr('transform', `translate(${margin.left + 10}, 38)`)
			.attr('class', 'riskPercent')
			.attr('x', (d) => d.value * 195)
			.attr('y', (d, i) => yScale(d.name, i))
			.attr('fill', '#EFEFEF')
			.style('font-weight', 'bold')
			.text((d) => (d.value > 0 ? `${Math.round(d.value * 100)}%` : '0%'));
	};

	//RENDERING UI CONTENT

	const renderDroughtStatus = (droughtStatus) => {
		const drought = (document.querySelector(
			'#drought-condition'
		).innerHTML = `<div style = "display: flex;">
          <div style = "width: max-content;">
            <p style="margin-bottom: 0">DROUGHT STATUS</p>
          </div>
          <div style = "margin: -6px 0 0 10px;">
            <h4 class = "bold trailer-0"> 
            ${droughtStatus}
            </h4>
          </div>
        </div>`);

		droughtStatus
			? drought
			: (document.querySelector('#drought-condition').innerHTML = '');
	};

	const clearWeatherGrid = () => {
		document.querySelector('#temp-wind-aq').innerHTML = `
      <div class="loader is-active padding-leader-3 padding-trailer-3">
        <div class="loader-bars"></div>
        <div class="loader-text">Loading...</div>
      </div>`;
	};

	const renderWeatherInformation = ({
		temp,
		wind,
		airQualityToday,
		airQualityTomorrow,
	}) => {
		const aqToday = airQualityToday;
		const aqTomorrow = airQualityTomorrow;

		const weatherContentHeader = (temp) => {
			if (temp.renderWeather) {
				infoItemHeader[1].innerHTML = `<p class = "trailer-0 padding-trailer-0 sectionHeader">WEATHER</p>
                                     <p class = "trailer-0 padding-leader-0 sectionSubHeader">At location</p>`;
			} else {
				infoItemHeader[1].innerHTML = ``;
			}
		};

		const renderWeatherGrid = async (temp) => {
			if (temp.renderWeather) {
				document.querySelector('#temp-wind-aq').innerHTML = `
          <div style = "
                    display: grid; 
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    grid-template-rows: auto auto auto;
                    gap: 0px;
                    margin: auto;">
                        <div class="item-1" style = "margin: 15px 0 10px -5px; text-align: center;">
                          <span class="unit-conversion underline" style = "cursor: pointer; display: block; margin: -5px 0 -15px 0;">&degF MPH</span>
                          </br>
                          <span class="unit-conversion" style = "cursor: pointer;">&degC KM/H</span>
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
                          <p style="margin: 1rem; text-align: center;">${temp.todayF}</p>
                        </div>
                        <div id = "tomorrow-temp">
                           <p style="margin: 1rem; text-align: center;">${temp.tomorrowF}</p>
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
    `;
			} else {
				setTimeout(
					() => (document.querySelector('#temp-wind-aq').innerHTML = ``),
					1000
				);
			}
		};

		renderWeatherGrid(temp);
		weatherContentHeader(temp);
		changeWeatherMetrics({ temp, wind });
	};

	const changeWeatherMetrics = ({ temp, wind }) => {
		const metric = document.querySelectorAll('.unit-conversion');

		const todayTempEL = document.querySelector('#today-temp');
		const tomorrowTempEl = document.querySelector('#tomorrow-temp');
		const todayWindEL = document.querySelector('#today-wind');
		const tomorrowWindEL = document.querySelector('#tomorrow-wind');

		const todayTempF = `<p style="margin: 1rem; text-align: center;">${temp.todayF}</p>`;
		const todayTempC = `<p style="margin: 1rem; text-align: center;">${temp.todayC}</p>`;
		const tomorrowTempF = `<p style="margin: 1rem; text-align: center;">${temp.tomorrowF}</p>`;
		const tomorrowTempC = `<p style="margin: 1rem; text-align: center;">${temp.tomorrowC}</p>`;
		const windTodayMPH = `<p style="margin: 1rem; text-align: center;"> ${wind.today.mph} </p>`;
		const windTodayKPH = `<p style="margin: 1rem; text-align: center;"> ${wind.today.kph} </p>`;
		const windTomorrowMPH = `<p style="margin: 1rem; text-align: center;"> ${wind.tomorrow.mph} </p>`;
		const windTomorrowKPH = `<p style="margin: 1rem; text-align: center;"> ${wind.tomorrow.kph} </p>`;

		metric.forEach((item) => {
			item.addEventListener('click', (event) => {
				!event.target.classList.contains('underline')
					? (metric.forEach((item) => {
							item.classList.remove('underline');
					  }),
					  event.target.classList.add('underline'))
					: null;

				event.target.innerText.includes('F')
					? ((todayTempEL.innerHTML = todayTempF),
					  (tomorrowTempEl.innerHTML = tomorrowTempF),
					  (todayWindEL.innerHTML = windTodayMPH),
					  (tomorrowWindEL.innerHTML = windTomorrowMPH))
					: ((todayTempEL.innerHTML = todayTempC),
					  (tomorrowTempEl.innerHTML = tomorrowTempC),
					  (todayWindEL.innerHTML = windTodayKPH),
					  (tomorrowWindEL.innerHTML = windTomorrowKPH));
			});
		});
	};

	const totalPopulationUIRender = async ({
		totalRadiusPopulation,
		perimeterPopulation,
	}) => {
		const containerSubheader = totalRadiusPopulation
			? 'Within circle (2 mile radius)'
			: 'Within fire Perimeter';

		const poepleContentHeader =
			(infoItemHeader[2].innerHTML = `<p class = "trailer-0 sectionHeader">POPULATION</p>
                                                               <p class = "trailer-0 sectionSubHeader">${containerSubheader}</p>`);

		poepleContentHeader;

		const populationObject = totalRadiusPopulation || perimeterPopulation;

		const totalPopulationSection = ({ populationObject }) => {
			document.querySelector('#general-population').innerHTML = `
      <div style = "margin-bottom: 10px;">
      <h3 class= "bold">${populationObject.totalPopulation}</h3>
      <p style = "margin: -5px auto -5px"> POPULATION </p>
      </div>
    `;
		};

		const disabilityPopulationSection = ({ populationObject }) => {
			document.querySelector('#disability').innerHTML = `
    <div style = "margin-bottom: 10px;">
    <h3 class = "bold text-center">${populationObject.percentofPopulationInPoverty}</h3>
    <p class= "text-center" style = "margin: -5px auto -5px; text-align: left;">DISABILITY</p>
    </div>
    `;
		};

		const povertyPopulationSection = ({ populationObject }) => {
			document.querySelector('#poverty').innerHTML = `
    <div style = "margin-bottom: 10px;">
    <h3 class = "bold text-center">${populationObject.percentofPopulationWithDisability}</h3>
    <p class= "text-center" style = "margin: -5px auto -5px; text-align: left;">POVERTY</p>
    </div>
    `;
		};

		const renderPopulationData = (() => {
			if (populationObject.totalPopulation) {
				totalPopulationSection({ populationObject });
				povertyPopulationSection({ populationObject });
				disabilityPopulationSection({ populationObject });
			} else {
				document.querySelector('#disability').innerHTML = ``;
				document.querySelector('#poverty').innerHTML = ``;
				return totalPopulationSection({ populationObject });
			}
		})();
	};

	const housingInfoRender = ({ radiusHousingData, perimeterHousingData }) => {
		const containerSubheader = radiusHousingData
			? 'Within circle (2 mile radius)'
			: 'Within fire Perimeter';

		const poepleContentHeader =
			(infoItemHeader[3].innerHTML = `<p class = "trailer-0 sectionHeader">HOUSING</p>
                                                              <p class = "trailer-0 sectionSubHeader">${containerSubheader}</p>`);

		poepleContentHeader;

		const areaHousingObject = radiusHousingData || perimeterHousingData;
		if (areaHousingObject.TotalHousingUnits && areaHousingObject.MedianValue) {
			document.querySelector('#housing-container').style.display = 'grid';

			document.querySelector('#housing-container-stats').innerHTML = `
      <div style = "margin-bottom: 10px">
      <h4 class= "bold">${areaHousingObject.TotalHousingUnits}</h4>
        <p style = "margin-bottom: -5px;">TOTAL HOUSING UNITS </p> 
      </div>
      <div>
      <h4 class = "bold" style = "line-height: 1.2;">${areaHousingObject.MedianValue}</h4>
        <p style = "margin-bottom: -5px;"> MEDIAN HOUSING VALUE </p>
      </div>
    `;
		} else {
			document.querySelector('#housing-container-stats').innerHTML = '';

			document.querySelector('#housing-container').style.display = 'none';

			infoItemHeader[3].innerHTML = '';
		}
	};

	const habitatInfoRender = ({ aggregateEcoObj, perimeterEcology }) => {
		const containerSubheader = aggregateEcoObj
			? 'Within circle (2 mile radius)'
			: 'Within fire Perimeter';

		const habitatContentControl = ({ ecoObject }) => {
			if (
				!ecoObject.L3EcoReg &&
				!ecoObject.LandForm &&
				!ecoObject.ForestTypeGroup &&
				ecoObject.RichClass
			) {
				return (
					(infoItemContent[4].style.display = `none`),
					(infoItemHeader[4].innerHTML = ``)
				);
			} else {
				return (
					(infoItemContent[4].style.display = `initial`),
					(infoItemHeader[4].innerHTML = `<p class = "trailer-0 sectionHeader">ECOSYSTEM</p>
                                                <p class = "trailer-0 sectionSubHeader">${containerSubheader}</p>`)
				);
			}
		};
		const nonePresentText = `<h4 class = "bold">None present</h4>`;

		const ecoObject = aggregateEcoObj || perimeterEcology;

		const ecoRegion = ({ ecoObject }) => {
			if (ecoObject.L3EcoReg) {
				return (document.querySelector('#ecoregion').innerHTML = `
     <div>
        <p class = "trailer-0">ECOREGION</p>
        <div style = "margin-bottom: 15px;">
          <h4 class = "bold" style = "margin-top: -7px; ">${ecoObject.L3EcoReg}</h4>
        </div>
      </div>`);
			} else {
				document.querySelector('#ecoregion').innerHTML = '';
			}
		};

		const landformType = ({ ecoObject }) => {
			if (ecoObject.LandForm) {
				return (document.querySelector('#landform').innerHTML = `
        <div>
            <p class = "trailer-0">LANDFORM TYPE</p>
            <div style = "margin-bottom: 15px;">
              <h4 class = "bold" style = "margin-top: -7px;">${ecoObject.LandForm}</h4>
            </div>
          </div>`);
			} else {
				return (document.querySelector('#landform').innerHTML = ``);
			}
		};

		const biodiversity = ({ ecoObject }) => {
			if (ecoObject.RichClass) {
				return (document.querySelector('#biodiversity').innerHTML = `
          <div style = "margin-bottom: 1.5625rem;">
            <div style = "width: 100%;">
              <div>
              <p class = "trailer-0">BIODIVERSITY</p>
            </div>
            <div style ="width: 100%; display: flex; text-align: center;">
              <div style = "width: 50%; text-align: center; align-self: center;">
              <h4 class = "bold">${ecoObject.RichClass}</h4>
                  <p style ="margin-bottom: 5px; margin-top: 5px;">Imperiled Species Biodiversity</p>
              </div>
              <div style = "width: 70%;">
              <div style = "width: 100%;">
                <img src="https://www.arcgis.com/sharing/rest/content/items/668bf6e91edd49d1bb8b3f00d677b315/data"
                  style="width:77px; height:77px;
                  // margin-right: 10px; 
                  display: inline-flex;" 
                  viewbox="0 0 70 70" 
                  class="svg-icon" 
                  type="image/svg+xml">
                <img src="https://www.arcgis.com/sharing/rest/content/items/bc5dc73ad7d345de840c128cc42cc938/data"
                  style="width:77px; height:77px; 
                  display: inline-flex;" 
                  viewbox="0 0 70 70" 
                  class="svg-icon" 
                  type="image/svg+xml">
                <img src="https://www.arcgis.com/sharing/rest/content/items/96a4af6a248b4da48f1b7bd703f88485/data"
                  style="width:77px; height:77px;
                  // margin-right: 7px;
                  display: inline-flex;" 
                  viewbox="0 0 70 70" 
                  class="svg-icon" 
                  type="image/svg+xml">
                <img src="https://www.arcgis.com/sharing/rest/content/items/3c9e63f9173a463ba4e5765c08cf7238/data"
                  style="width:77px; height:77px; 
                  display: inline-flex;" 
                  viewbox="0 0 70 70" 
                  class="svg-icon" 
                  type="image/svg+xml">
                </div> 
              </div>
            </div>
          </div>`);
			} else {
				return (document.querySelector('#biodiversity').innerHTML = ``);
			}
		};

		const criticalHabitat = ({ ecoObject }) => {
			if (ecoObject.CritHab) {
				return (document.querySelector('#criticalHabitat').innerHTML = `
      <div style = margin-top: 10px>
        <p style = "margin-bottom: 2px;">CRITICAL HABITAT DESIGNATION</p>
        <div class = "ecoregionInformation">
          <h4 class = "bold">${ecoObject.CritHab}</h4>
        </div>
      </div>`);
			} else {
				return (document.querySelector('#criticalHabitat').innerHTML = `
      <div style = margin-top: 10px>
        <p style = "margin-bottom: 2px;">CRITICAL HABITAT DESIGNATION</p>
        <div class = "ecoregionInformation">
          <h4 class = "bold">${nonePresentText}</h4>
        </div>
      </div>`);
			}
		};

		const protectedAreas = ({ ecoObject }) => {
			if (ecoObject.OwnersPadus) {
				const shortPadusList = `<h4 class = "bold">${ecoObject.OwnersPadus.join(
					', '
				)}</h4>`;
				const longPadusList = `<p class = "bold">${ecoObject.OwnersPadus.join(
					', '
				)}</p>`;

				return (document.querySelector('#protectedAreas').innerHTML = `
      <div>
        <p style = "margin-bottom: 2px;">PUBLIC LANDS & PROTECTED AREAS</p>
        <div class = "ecoregionInformation">
          <div>${
						ecoObject.OwnersPadus.length < 4 ? shortPadusList : longPadusList
					}</div>
        </div>
      </div>`);
			} else {
				return (document.querySelector('#protectedAreas').innerHTML = `
      <div>
        <p style = "margin-bottom: 2px;">PROTECTED AREAS, TRIBAL LANDS, </br>& WILDERNESS AREAS</p>
        <div class = "ecoregionInformation">
          <div>${nonePresentText}</div>
        </div>
      </div>`);
			}
		};

		const forestGroupSection = ({ ecoObject }) => {
			if (ecoObject.ForestTypeGroup) {
				return (document.querySelector('#forestType').innerHTML = `
        <div>
          <p style = "margin-bottom: 2px;">PREDOMINANT FOREST TYPE GROUPS</p>
          <div class = "ecoregionInformation">
            <h4 class = "bold">${
							ecoObject.ForestTypeGroup.length > 1
								? ecoObject.ForestTypeGroup[0].trim() +
								  ' and ' +
								  ecoObject.ForestTypeGroup[1].trim()
								: ecoObject.ForestTypeGroup[0].trim()
						}</h4>
          </div>
        </div>`);
			} else {
				return (document.querySelector('#forestType').innerHTML = ``);
			}
		};

		const potentialCarbon = ({ ecoObject }) => {
			if (ecoObject.SumCarbon) {
				return (document.querySelector('#carbon').innerHTML = `
      <div  style="margin-top: 15px;>
        <p style = "margin-bottom: 2px;">POTENTIAL CARBON LOSS</p>
        <div class = "ecoregionInformation">
          <div style = "position: relative;">            
            <h4 class = "bold">${ecoObject.SumCarbon.toLocaleString()} tons</h4>
            </div>
          </div>
      </div>
      `);
			} else {
				return (document.querySelector('#carbon').innerHTML = ``);
			}
		};

		const renderEcologyData = ({ ecoObject }) => {
			habitatContentControl({ ecoObject });
			ecoRegion({ ecoObject });
			landformType({ ecoObject });
			forestGroupSection({ ecoObject });
			potentialCarbon({ ecoObject });
			biodiversity({ ecoObject });
			criticalHabitat({ ecoObject });
			protectedAreas({ ecoObject });
		};

		renderEcologyData({ ecoObject });
	};
});
