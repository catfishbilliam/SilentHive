let lineChart;
let barChart;

function toggleDropdown(container) {
    const content = container.querySelector(".info-content");
    const caret = container.querySelector(".caret");
    const header = container.querySelector(".header");

    if (!content || !caret || !header) return;

    header.addEventListener("click", () => {
        const isExpanded = container.classList.contains("expanded");

        if (isExpanded) {
            console.log("Collapsing dropdown.");
            content.style.display = "none";
            caret.classList.remove("open");
            container.classList.remove("expanded");
            container.style.maxHeight = "50px"; // Collapsed height
            container.style.overflowY = "hidden"; // Disable scrolling
        } else {
            console.log("Expanding dropdown.");
            content.style.display = "block";
            const contentHeight = content.scrollHeight;
            const maxAvailableHeight =
                window.innerHeight - container.getBoundingClientRect().top - 20;

            container.style.maxHeight = `${Math.min(contentHeight + 50, maxAvailableHeight)}px`;
            container.style.overflowY = "auto"; // Enable scrolling
            caret.classList.add("open");
            container.classList.add("expanded");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && isSmallScreen) {
        // Display a message for mobile users
        document.body.style.backgroundColor = "black";
        document.body.style.color = "white";
        document.body.style.display = "flex";
        document.body.style.justifyContent = "center";
        document.body.style.alignItems = "center";
        document.body.style.height = "100vh";
        document.body.style.textAlign = "center";
        document.body.style.fontFamily = "Arial, sans-serif";
        document.body.innerHTML = `
            <div>
                <h1 style="font-size: 24px; margin-bottom: 10px;">Please open the app on a desktop or tablet for the best experience.</h1>
                <p style="font-size: 18px;">Mobile phones are not supported at this time.</p>
            </div>
        `;
        console.log("[INFO] Mobile user detected. Displaying message.");
        return; // Stop further execution
    }

    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);
    const customLoadingScreen = document.getElementById("customLoadingScreen");
    const mainContainer = document.getElementById("main-container");
    const infoContainer = document.getElementById("title-info-container");
    const stateContainer = document.getElementById("state-info-container");

    

    // Show the loading UI immediately
    BABYLON.Engine.prototype.displayLoadingUI = function () {
        if (customLoadingScreen) {
            customLoadingScreen.style.display = "flex";
            customLoadingScreen.style.opacity = "1";
        }
        if (mainContainer) {
            mainContainer.style.display = "none";
        }
    };

    // Hide the loading UI once ready
    BABYLON.Engine.prototype.hideLoadingUI = function () {
        if (customLoadingScreen) {
            customLoadingScreen.style.opacity = "0";
            setTimeout(() => {
                customLoadingScreen.style.display = "none";
                if (mainContainer) {
                    mainContainer.style.display = "block";
                }

                // Apply dropdown functionality after showing main content
                if (infoContainer) toggleDropdown(infoContainer);
                if (stateContainer) toggleDropdown(stateContainer);

                const disappearedBeesContainer = document.getElementById("disappeared-bees-container");
                if (disappearedBeesContainer) toggleDropdown(disappearedBeesContainer);
            }, 500);
        }
    };

    // Display loading UI immediately
    engine.displayLoadingUI();

    // Example toggleDropdown usage
    if (infoContainer) toggleDropdown(infoContainer);
    if (stateContainer) toggleDropdown(stateContainer);

    const disappearedBeesContainer = document.getElementById("disappeared-bees-container");
    if (disappearedBeesContainer) toggleDropdown(disappearedBeesContainer);

    let selectedYear = 2019;
    let selectedState = null;
    let newMeshes = [];
    let registeredColoniesData = null;
    const hoverColor = new BABYLON.Color3(0.92, 0.62, 0.24); 
    const originalColor = new BABYLON.Color3(1, 0.843, 0); 

    const stateNames = {
    "Alabama_Cube.033": "ALABAMA",
    "Alaska_Plane": "ALASKA",
    "Arizona_Cube.005": "ARIZONA",
    "Arkansas_Cube.027": "ARKANSAS",
    "California_Cube.006": "CALIFORNIA",
    "Colorado_Cube.002": "COLORADO",
    "Connecticut_Cube.048": "CONNECTICUT",
    "Delaware_Cube.041": "DELAWARE",
    "Florida_Cube.028": "FLORIDA",
    "Georgia_Cube.036": "GEORGIA",
    "Hawaii_Plane.001": "HAWAII",
    "Idaho_Cube.011": "IDAHO",
    "Illinois_Cube.022": "ILLINOIS",
    "Indiana_Cube.025": "INDIANA",
    "Iowa_Cube.019": "IOWA",
    "Kansas_Cube.016": "KANSAS",
    "Kentucky_Cube.030": "KENTUCKY",
    "Louisiana_Cube.031": "LOUISIANA",
    "Maine_Cube.017": "MAINE",
    "Maryland_Cube.040": "MARYLAND",
    "Massachusetts_Cube.047": "MASSACHUSETTS",
    "Michigan_Cube.024": "MICHIGAN",
    "Minnesota_Cube.018": "MINNESOTA",
    "Mississippi_Cube.032": "MISSISSIPPI",
    "Missouri_Cube.021": "MISSOURI",
    "Montana_Cube.012": "MONTANA",
    "Nebraska_Cube.015": "NEBRASKA",
    "Nevada_Cube.004": "NEVADA",
    "New_Hampshire_Cube.044": "NEW HAMPSHIRE",
    "New_Jersey_Cube.043": "NEW JERSEY",
    "New_Mexico_Cube.001": "NEW MEXICO",
    "New_York_Cube": "NEW YORK",
    "North_Carolina_Cube.038": "NORTH CAROLINA",
    "North_Dakota_Cube.013": "NORTH DAKOTA",
    "Ohio_Cube.029": "OHIO",
    "Oklahoma_Cube.020": "OKLAHOMA",
    "Oregon_Cube.010": "OREGON",
    "Pennsylvania_Cube.042": "PENNSYLVANIA",
    "Rhode_Island_Cube.046": "RHODE ISLAND",
    "South_Carolina_Cube.037": "SOUTH CAROLINA",
    "South_Dakota_Cube.014": "SOUTH DAKOTA",
    "Tennessee_Cube.034": "TENNESSEE",
    "Texas_Cube.026": "TEXAS",
    "Utah_Cube.003": "UTAH",
    "Vermont_Cube.045": "VERMONT",
    "Virginia_Cube.039": "VIRGINIA",
    "Washington_Cube.009": "WASHINGTON",
    "West_Virginia_Cube.035": "WEST VIRGINIA",
    "Wisconsin_Cube.023": "WISCONSIN",
    "Wyoming_Cube.007": "WYOMING"
    };

    function logDetail(message, data = null) {
        console.log(`[DEBUG] ${message}`);
        if (data) {
            console.log(data);
        }
    }


function toTitleCase(str) {
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

async function fetchRegisteredColoniesData() {
    try {
        const response = await fetch('/registered_colonies.json');
        if (response.ok) {
            const data = await response.json();
            logDetail('[DEBUG] Registered colonies data loaded successfully.', data);
            return data;
        } else {
            logDetail('[ERROR] Error loading registered colonies data:', response.statusText);
            alert('Failed to load registered colonies data. Some features may not work properly.');
            return null;
        }
    } catch (error) {
        logDetail('[ERROR] Error fetching registered colonies data:', error);
        alert('An error occurred while loading registered colonies data.');
        return null;
    }
}

async function fetchMonthlyColonyData(year) {
    try {
        const response = await fetch(`/api/monthly/${year}`);
        if (response.ok) {
            const data = await response.json();
            logDetail(`[DEBUG] Data for ${year} received:`, data);
            return data;
        } else {
            logDetail(`[ERROR] Error fetching data: Status ${response.status}`);
            return null;
        }
    } catch (error) {
        logDetail('[ERROR] Error fetching monthly colony data:', error);
        return null;
    }
}

function calculatePercentageLoss(totalLoss, coloniesRegistered) {
    if (coloniesRegistered && coloniesRegistered > 0) {
        return ((totalLoss / coloniesRegistered) * 100).toFixed(2);
    }
    return null;
}

function initializeCharts() {
    console.log("[INFO] Initializing charts");
    initializeEmptyLineChart(); 
    initializeEmptyBarChart(); 
}

function initializeEmptyLineChart() {
    const canvas = document.getElementById('line-chart');
    if (!canvas) {
        console.error("[ERROR] Canvas element with ID 'line-chart' not found.");
        return;
    }

    if (lineChart) {
        lineChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], 
            datasets: [{
                label: 'Total Loss per Year',
                data: [], 
                borderColor: 'rgba(255, 186, 59, 1)',
                backgroundColor: 'rgba(255, 186, 59, 0.2)',
                fill: true,
            }]
        },
        options: {
            responsive: true, // Enable responsiveness
            maintainAspectRatio: false, // Disable default aspect ratio to fit parent container
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    },
                    ticks: {
                        font: {
                            size: 10, // Adjust tick font size for mobile
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Total Loss'
                    },
                    ticks: {
                        font: {
                            size: 10, // Adjust tick font size for mobile
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 12 // Adjust legend font size for mobile
                        }
                    }
                }
            }
        }
    });

    console.log("[INFO] Empty line chart initialized");
}

function initializeEmptyBarChart() {
    const canvas = document.getElementById('bar-chart');
    if (!canvas) {
        console.error("[ERROR] Canvas element with ID 'bar-chart' not found.");
        return;
    }

    if (barChart) {
        barChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [], 
            datasets: [{
                label: 'Total Loss per Quarter',
                data: [], 
                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true, // Enable responsiveness
            maintainAspectRatio: false, // Fit to parent container
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Quarter'
                    },
                    ticks: {
                        font: {
                            size: 10, // Adjust tick font size for mobile
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Total Loss'
                    },
                    ticks: {
                        font: {
                            size: 10, // Adjust tick font size for mobile
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 12 // Adjust legend font size for mobile
                        }
                    }
                }
            }
        }
    });

    console.log("[INFO] Empty bar chart initialized");
}


async function updateLineChart(state) {
    console.log(`[INFO] Updating line chart for state: ${state}`);
    const years = [2019, 2020, 2021, 2022, 2023];
    const annualTotals = [];

    for (const year of years) {
        const colonyLossData = await fetchMonthlyColonyData(year);
        if (colonyLossData) {
            const stateData = colonyLossData.filter(record => record.state.toUpperCase() === state.toUpperCase());
            const totalLossForYear = stateData.reduce((acc, record) => acc + (record.coloniesLost || 0), 0);
            annualTotals.push(totalLossForYear);
        } else {
            console.error(`[ERROR] No colony loss data available for the year ${year}.`);
            annualTotals.push(0);
        }
    }

    lineChart.data.labels = years; 
    lineChart.data.datasets[0].data = annualTotals; 
    lineChart.update();
    console.log("[INFO] Line chart updated with annual totals.");
}
async function updateBarChart(state, year) {
    console.log(`[INFO] Updating bar chart for state: ${state}, year: ${year}`);

    const colonyLossData = await fetchMonthlyColonyData(year);
    if (colonyLossData) {
        const stateData = colonyLossData.filter(record => record.state.toUpperCase() === state.toUpperCase());

        if (stateData.length > 0) {
            const quarterlyData = [
                stateData.find(record => record.month === 'JAN THRU MAR')?.coloniesLost || 0,
                stateData.find(record => record.month === 'APR THRU JUN')?.coloniesLost || 0,
                stateData.find(record => record.month === 'JUL THRU SEP')?.coloniesLost || 0,
                stateData.find(record => record.month === 'OCT THRU DEC')?.coloniesLost || 0
            ];

            barChart.data.labels = ['Q1 (Jan-Mar)', 'Q2 (Apr-Jun)', 'Q3 (Jul-Sep)', 'Q4 (Oct-Dec)'];
            barChart.data.datasets[0].data = quarterlyData; 
            barChart.update();
            console.log("[INFO] Bar chart updated with quarterly totals.");
        } else {
            console.error(`[ERROR] No data found for ${state} in year ${year}.`);
        }
    } else {
        console.error(`[ERROR] No colony loss data available for ${state} in year ${year}.`);
    }
}

async function assignDataToStates(stateMeshes, year) {
    const registeredColoniesData = await fetchRegisteredColoniesData();
    if (!registeredColoniesData) {
        logDetail('[ERROR] Registered colonies data could not be fetched.');
        return;
    }

    const colonyLossData = await fetchMonthlyColonyData(year);
    if (!colonyLossData) {
        logDetail(`[ERROR] No colony loss data available for the year ${year}.`);
        return;
    }

    for (let mesh of stateMeshes) {
        if (mesh.metadata && mesh.metadata.stateName) {
            const stateName = toTitleCase(mesh.metadata.stateName);
            const coloniesRegistered = registeredColoniesData?.[year]?.[stateName]?.value || null;

            const stateLossData = colonyLossData.filter(record => toTitleCase(record.state) === stateName);
            const totalLoss = stateLossData.reduce((acc, record) => acc + (record.coloniesLost || 0), 0);
            const percentageChange = calculatePercentageLoss(totalLoss, coloniesRegistered);

            mesh.metadata.colonyCollapse = {
                totalLoss: totalLoss || 0, 
                coloniesRegistered: coloniesRegistered || 'Data not available',
                percentageChange: percentageChange || 'N/A',
                Q1: stateLossData.find(record => record.month === 'JAN THRU MAR')?.coloniesLost || 0,
                Q2: stateLossData.find(record => record.month === 'APR THRU JUN')?.coloniesLost || 0,
                Q3: stateLossData.find(record => record.month === 'JUL THRU SEP')?.coloniesLost || 0,
                Q4: stateLossData.find(record => record.month === 'OCT THRU DEC')?.coloniesLost || 0
            };

            logDetail(`[DEBUG] Assigned data to ${stateName}: Total Loss = ${totalLoss}`);
        }
    }
}


async function handleStateSelection(state) {
    console.log(`[INFO] State selected: ${state}`);
    await updateBarChart(state, selectedYear);
    const years = [2019, 2020, 2021, 2022, 2023];
    await updateLineChart(state, years);
    console.log("[INFO] Charts updated for state selection.");
}

function logDetail(message, data = null) {
    console.log(message);
    if (data) {
        console.log(data);
    }
}

const updateStateInfoContainer = (mesh, metadata) => {
    const yearElement = document.getElementById("year-selected");
    const stateNameElement = document.getElementById("state-name");
    const totalLossElement = document.getElementById("total-loss");
    const registeredColoniesElement = document.getElementById("registered-colonies");
    const percentageLossElement = document.getElementById("percentage-loss");

    yearElement.textContent = selectedYear;
    stateNameElement.textContent = metadata.stateName || 'N/A';

    if (metadata.colonyCollapse) {
        const { totalLoss, coloniesRegistered, percentageChange } = metadata.colonyCollapse;
        totalLossElement.textContent = totalLoss !== null ? `${totalLoss} colonies` : 'Data not available';
        registeredColoniesElement.textContent = coloniesRegistered !== null ? coloniesRegistered : 'Data not available';
        percentageLossElement.textContent = percentageChange !== null ? `${percentageChange}%` : 'N/A';
        updateDisappearedBeesCount(totalLoss); 
    } else {
        totalLossElement.textContent = 'No data available';
        registeredColoniesElement.textContent = 'No data available';
        percentageLossElement.textContent = 'N/A';
    }
};

const updateDisappearedBeesCount = (totalLoss) => {
    const disappearedBeesValue = document.getElementById("disappeared-bees-value");
    const beeCount = totalLoss * 20000; 
    disappearedBeesValue.textContent = `${beeCount.toLocaleString()} bees`; 
};

    function handlePointerOver(mesh) {
        mesh.material.diffuseColor = hoverColor;
    }

    function handlePointerOut(mesh) {
        mesh.material.diffuseColor = originalColor;
    }

    async function handlePointerClick(mesh) {
    if (mesh.metadata && mesh.metadata.stateName) {
        selectedState = mesh.metadata.stateName;
        updateStateInfoContainer(mesh, mesh.metadata);
        logDetail(`User clicked on ${selectedState}.`);

        const totalLoss = mesh.metadata.colonyCollapse?.totalLoss || 0; 

        createBeeParticleSystem(mesh, totalLoss); 
        await handleStateSelection(selectedState); 
    } else {
        logDetail(`[ERROR] No metadata available for clicked mesh.`);
    }
}


function createBeeParticleSystem(emitter, totalLoss) {
const beeCount = totalLoss ? totalLoss * 50 : 0;


    const beeParticleSystem = new BABYLON.ParticleSystem("beeParticles", beeCount, scene); 
    beeParticleSystem.particleTexture = new BABYLON.Texture("/assets/honeybee.png", scene); 
    beeParticleSystem.particleTexture.generateMipMaps = true; 
    beeParticleSystem.particleTexture.updateSamplingMode(BABYLON.Texture.TRILINEAR_SAMPLINGMODE); 
    beeParticleSystem.emitter = emitter;  
    beeParticleSystem.minEmitPower = 1;
    beeParticleSystem.maxEmitPower = 3;
    beeParticleSystem.updateSpeed = 0.01;
    beeParticleSystem.minSize = 2; 
    beeParticleSystem.maxSize = 3; 
    beeParticleSystem.color1 = new BABYLON.Color4(1, 1, 0, 1); 
    beeParticleSystem.color2 = new BABYLON.Color4(1, 1, 0, 1); 
    beeParticleSystem.colorDead = new BABYLON.Color4(1, 0.8, 0, 1); 

    beeParticleSystem.startDirectionFunction = function (particle) {
        const angle = Math.random() * Math.PI * 2; 
        particle.direction = new BABYLON.Vector3(Math.cos(angle), 0, Math.sin(angle)); 
    };

    beeParticleSystem.emitRate = beeCount; 
    beeParticleSystem.minLifeTime = 2;
    beeParticleSystem.maxLifeTime = 5;

    if (beeCount > 0) {
        beeParticleSystem.start();
        console.log(`[INFO] Bee particle system started with ${beeCount} particles.`);
        
        beeParticleSystem.direction1 = new BABYLON.Vector3(0, 1, 1);
        beeParticleSystem.direction2 = new BABYLON.Vector3(0, 1, 1);

        beeParticleSystem.minEmitBox = new BABYLON.Vector3(-10, 0, -10); 
        beeParticleSystem.maxEmitBox = new BABYLON.Vector3(10, 0, 10); 

        setTimeout(() => {
            beeParticleSystem.stop();
            beeParticleSystem.reset();
        }, 10000);
    } else {
        console.log("[INFO] No bees to emit (totalLoss is zero or undefined).");
    }
}

function createScene() {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 500, new BABYLON.Vector3(0, -50, 0), scene);
    camera.attachControl(canvas, true);

    const hemisphericLight = new BABYLON.HemisphericLight("hemisphericLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemisphericLight.intensity = 0.6; 
    console.log("[INFO] Hemispheric light added with intensity: 0.6");

    const directionalLight = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(-1, -2, -1), scene);
    directionalLight.position = new BABYLON.Vector3(100, 200, 100);
    directionalLight.intensity = 1.0; 
    console.log("[INFO] Directional light added with intensity: 1.0");

    const honeycombTexture = new BABYLON.Texture("./textures/yellow-honeycomb2-texture.jpg", scene);
    const honeycombMaterial = new BABYLON.StandardMaterial("honeycombMaterial", scene);
    honeycombMaterial.diffuseTexture = honeycombTexture;
    honeycombMaterial.backFaceCulling = false;

    const backgroundCube = BABYLON.MeshBuilder.CreateBox("backgroundCube", { size: 1000 }, scene);
    backgroundCube.material = honeycombMaterial;

    logDetail("Loading U.S. map...");
    BABYLON.SceneLoader.ImportMesh("", "/models/", "united_states.obj", scene, function (loadedMeshes) {
        newMeshes = loadedMeshes;
        newMeshes.forEach(mesh => {
            mesh.scaling = new BABYLON.Vector3(60, 60, 60);
            mesh.rotation.x = Math.PI / 2;

            const goldMaterial = new BABYLON.StandardMaterial("goldMaterial", scene);
            goldMaterial.diffuseColor = originalColor;
            mesh.material = goldMaterial;

            mesh.metadata = {
                stateName: stateNames[mesh.name] || null,
                colonyCollapse: null
            };

            if (mesh.metadata.stateName) {
                mesh.actionManager = new BABYLON.ActionManager(scene);
                mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPointerOverTrigger,
                    () => handlePointerOver(mesh)
                ));
                mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPointerOutTrigger,
                    () => handlePointerOut(mesh)
                ));
                mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
                    BABYLON.ActionManager.OnPickTrigger,
                    () => handlePointerClick(mesh)
                ));
            }
        });

        assignDataToStates(newMeshes, selectedYear);
    });

    return scene;
}

async function handleStateSelection(state) {
    await updateBarChart(state, selectedYear);
    const years = [2019, 2020, 2021, 2022, 2023];
    await updateLineChart(state, years);
}

    initializeEmptyLineChart();
    initializeEmptyBarChart();

    const yearSelector = document.getElementById('year-selector');
    const yearSelect = document.getElementById('year-select');

    function toggleYearSelector(container) {
        const content = container.querySelector('.info-content');
        const caret = container.querySelector('.caret');
        const header = container.querySelector('.header');

        if (!content || !caret || !header) return;

        header.addEventListener('click', () => {
            const isExpanded = container.classList.contains('expanded');

            if (isExpanded) {
                content.style.display = 'none';
                caret.classList.remove('open');
                container.classList.remove('expanded');
                container.style.maxHeight = '50px';
            } else {
                content.style.display = 'block';
                caret.classList.add('open');
                container.classList.add('expanded');
                container.style.maxHeight = '200px'; 
            }
        });
    }

    if (yearSelector) toggleYearSelector(yearSelector);

    yearSelect.addEventListener('change', (event) => {
    selectedYear = event.target.value;
    console.log(`Year selected: ${selectedYear}`);
    if (selectedState) {
        updateBarChart(selectedState, selectedYear);
    }
});

const stateDropdown = document.getElementById("state-dropdown");

if (stateDropdown) {
    stateDropdown.addEventListener("change", async (event) => {
        const selectedStateName = event.target.value;

        if (selectedStateName) {
            const selectedMesh = newMeshes.find(
                mesh => mesh.metadata && mesh.metadata.stateName === selectedStateName
            );

            if (selectedMesh) {
                const totalLoss = selectedMesh.metadata.colonyCollapse?.totalLoss || 0;
                createBeeParticleSystem(selectedMesh, totalLoss);
                updateStateInfoContainer(selectedMesh, selectedMesh.metadata);
                console.log(`[INFO] Dropdown selection: ${selectedStateName}`);
                await handleStateSelection(selectedStateName); 
            } else {
                console.error(`[ERROR] No mesh found for state: ${selectedStateName}`);
            }
        }
    });
}

    const scene = createScene();
    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener('resize', () => {
        engine.resize();
    });

     // Hide the loading UI once the scene is ready
     scene.executeWhenReady(() => {
        engine.hideLoadingUI();
        console.log("[DEBUG] Scene is fully loaded and ready.");
    });

    scene.executeWhenReady(() => {
        engine.hideLoadingUI();
        console.log("[DEBUG] Scene is fully loaded and ready.");
    });
});