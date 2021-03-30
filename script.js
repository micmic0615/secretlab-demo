var SAVEFILE = {
    mainId: "",
    images: []
}

var ANNOTATION_PHASE = 0;
var ANNOTATION_POINT_ONE = {x:0,y:0,w:0,h:0};
var ANNOTATION_POINT_TWO = {x:0,y:0,w:0,h:0};

const LOCAL_STORAGE_KEY = "S_LAB_STORAGE";

const COLOR_CYCLE = [
    "#9784d5",
    "#6db27d",
    "#00c2e2",
    "#beca30",
    "#f8e9a5",
    "#f842ca",
];

const imageSchema = {
    id: "",
    path: "",
    annotations: []
}

const annotationSchema = {
    x1: 0, 
    y1: 0, 
    x2: 0, 
    y2: 0, 
    comment: "",
    color: ""
}

const initializePage = () => {
    let localStorageData = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (localStorageData){
        SAVEFILE = {...JSON.parse(localStorageData)};
    } 

    renderSaveFile(true);

    let canvas = document.querySelector("#canvas-annotation");

    canvas.addEventListener('mousedown', (e) => {
        let x = e.offsetX, y = e.offsetY, w = e.target.offsetWidth, h = e.target.offsetHeight;

        

        if (ANNOTATION_PHASE === 0){
            let annotationList = document.querySelector("#annotation-list");
            annotationList.style.opacity = 0.2;

            ANNOTATION_POINT_ONE = {x,y,w,h};
            ANNOTATION_PHASE = 1;

            let annotationBoxes = document.querySelectorAll(".annotation-box");
            for (let i = 0; i < annotationBoxes.length; i++) {
                const p = annotationBoxes[i];
                p.style.pointerEvents = "none";
            }

        } else if (ANNOTATION_PHASE === 1) {
            ANNOTATION_POINT_TWO = {x,y,w,h};
            openAnnotationTextBox()
        }
    });

    canvas.addEventListener('touchstart', (e) => {
        let rect = e.target.getBoundingClientRect();
        let x = e.touches[0].pageX - rect.left, y = e.touches[0].pageY - rect.top - window.scrollY, w = e.target.offsetWidth, h = e.target.offsetHeight;

        if (ANNOTATION_PHASE === 0){
            let annotationList = document.querySelector("#annotation-list");
            annotationList.style.opacity = 0.2;

            ANNOTATION_POINT_ONE = {x,y,w,h};
            ANNOTATION_PHASE = 1;

           

            let annotationBoxes = document.querySelectorAll(".annotation-box");
            for (let i = 0; i < annotationBoxes.length; i++) {
                const p = annotationBoxes[i];
                p.style.pointerEvents = "none";
            }

        } else if (ANNOTATION_PHASE === 1) {
            ANNOTATION_POINT_TWO = {x,y,w,h};
            openAnnotationTextBox()
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (ANNOTATION_PHASE === 1) {
            let x = e.offsetX, y = e.offsetY, w = e.target.offsetWidth, h = e.target.offsetHeight;
            ANNOTATION_POINT_TWO = {x,y,w,h};
            
            renderDrawPoints();
        }
    });

    canvas.addEventListener('touchmove', (e) => {
        if (ANNOTATION_PHASE === 1) {
            
            let rect = e.target.getBoundingClientRect();
            let x = e.touches[0].pageX - rect.left, y = e.touches[0].pageY - rect.top - window.scrollY, w = e.target.offsetWidth, h = e.target.offsetHeight;
            ANNOTATION_POINT_TWO = {x,y,w,h};
            renderDrawPoints();
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        if (ANNOTATION_PHASE === 1 ) {
            let x = e.offsetX, y = e.offsetY, w = e.target.offsetWidth, h = e.target.offsetHeight;
            ANNOTATION_POINT_TWO = {x,y,w,h};
            openAnnotationTextBox()
        }
    });

    canvas.addEventListener('touchend', (e) => {
        if (ANNOTATION_PHASE === 1 ) {
            let rect = e.target.getBoundingClientRect();
            let x = e.changedTouches[0].pageX - rect.left, y = e.changedTouches[0].pageY - rect.top - window.scrollY, w = e.target.offsetWidth, h = e.target.offsetHeight;
            ANNOTATION_POINT_TWO = {x,y,w,h};
            openAnnotationTextBox()
        }
    });

    let textBox = document.querySelector("#input-annotation")
    textBox.addEventListener("keyup", (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            saveAnnotation();
        }
    });

    textBox.addEventListener("blur", (e) => {
        saveAnnotation();
    });
}

const generateRandomId = () => {
    return String(Math.round(Math.random()*9999) * Math.round(Math.random()*9999) * Math.round(Math.random()*9999) * Math.round(Math.random()*9999));
}

const getCurrentImageIndex = () => {
    let currentIndex = null;
    SAVEFILE.images.forEach((item, index) => {
        if (item.id === SAVEFILE.mainId){
            currentIndex = index;
        }
    })

    return currentIndex;
}

const uploadFile = () => {
    let file = document.querySelector("#input-file").files[0];
    let reader = new FileReader();

    reader.onloadend =  () => {
        let newImage = {...imageSchema};
        newImage.id = generateRandomId();
        newImage.path = reader.result;
        newImage.annotations = [];

        let ci = getCurrentImageIndex();
        SAVEFILE.images.splice(ci + 1, 0, newImage)

        SAVEFILE.mainId = newImage.id;

        document.querySelector("#input-form").reset()

        renderSaveFile();
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}

const deleteImage = () => {
    let ci = getCurrentImageIndex();

    let saveImages = [...SAVEFILE.images];

    saveImages.splice(ci, 1)

    SAVEFILE.images = saveImages;

    if (SAVEFILE.images[ci]){
        SAVEFILE.mainId = SAVEFILE.images[ci].id;
    } else if (SAVEFILE.images[ci - 1]){
        SAVEFILE.mainId = SAVEFILE.images[ci - 1].id;
    } else {
        SAVEFILE.mainId = "";
    }

    renderSaveFile();
}

const switchImage = (step, direct) => {
    let ci = getCurrentImageIndex();
    let nextImage = direct ? SAVEFILE.images[step] : SAVEFILE.images[ci + step];
    if (nextImage){
        SAVEFILE.mainId = nextImage.id;
        renderSaveFile();
    }
}

const openAnnotationTextBox = () => {
    if (Math.abs(ANNOTATION_POINT_ONE.x - ANNOTATION_POINT_TWO.x) > 10 && Math.abs(ANNOTATION_POINT_ONE.y - ANNOTATION_POINT_TWO.y) > 10){
        ANNOTATION_PHASE = 2;

        let x1 = Math.min(ANNOTATION_POINT_ONE.x, ANNOTATION_POINT_TWO.x);
        let y1 = Math.min(ANNOTATION_POINT_ONE.y, ANNOTATION_POINT_TWO.y);

        let x2 = Math.max(ANNOTATION_POINT_ONE.x, ANNOTATION_POINT_TWO.x);
        let y2 = Math.max(ANNOTATION_POINT_ONE.y, ANNOTATION_POINT_TWO.y);

        let textBox = document.querySelector("#input-annotation");
        textBox.style.display = "block";
        textBox.style.left = (x1 + 2) + "px";
        textBox.style.top = (y1 + 2) + "px";

        textBox.style.width = (x2 - x1 - 4) + "px";
        textBox.style.height = (y2 - y1 - 4) + "px"
    
        textBox.value = "";
    
        textBox.focus();
    } else {
        ANNOTATION_PHASE = 0;

        let textBox = document.querySelector("#input-annotation");
        textBox.style.display = "none";

        let annotationList = document.querySelector("#annotation-list");
        annotationList.style.opacity = 1;

        let annotationBoxes = document.querySelectorAll(".annotation-box");
        for (let i = 0; i < annotationBoxes.length; i++) {
            const p = annotationBoxes[i];
            p.style.pointerEvents = "all";
        }

        renderSaveFile();
    }
}

const deleteAnnotationTextBox = (index) => {
    let ci = getCurrentImageIndex();

    let currentAnnotations = [...SAVEFILE.images[ci].annotations];

    currentAnnotations.splice(index, 1);

    SAVEFILE.images[ci].annotations = [...currentAnnotations];

    renderSaveFile();
}

const saveAnnotation = () => {
    if (ANNOTATION_PHASE === 2){
        ANNOTATION_PHASE = 0;

        let x1 = ANNOTATION_POINT_ONE.x / ANNOTATION_POINT_ONE.w;
        let y1 = ANNOTATION_POINT_ONE.y / ANNOTATION_POINT_ONE.h;
        let x2 = ANNOTATION_POINT_TWO.x / ANNOTATION_POINT_TWO.w;
        let y2 = ANNOTATION_POINT_TWO.y / ANNOTATION_POINT_TWO.h;
       
        let textBox = document.querySelector("#input-annotation");
        textBox.style.display = "none";

        let annotationList = document.querySelector("#annotation-list");
        annotationList.style.opacity = 1;

        let annotationBoxes = document.querySelectorAll(".annotation-box");
        for (let i = 0; i < annotationBoxes.length; i++) {
            const p = annotationBoxes[i];
            p.style.pointerEvents = "all";
        }

        let newAnnotation = {...annotationSchema};
        newAnnotation.x1 = Math.min(x1,x2);
        newAnnotation.x2= Math.max(x1,x2);
        newAnnotation.y1 = Math.min(y1,y2);
        newAnnotation.y2 = Math.max(y1,y2);
        newAnnotation.comment = textBox.value;
        newAnnotation.color = COLOR_CYCLE[Math.floor(Math.random() * COLOR_CYCLE.length)];

        let ci = getCurrentImageIndex();

        SAVEFILE.images[ci].annotations.push(newAnnotation);

        renderSaveFile();
    }
}

const renderDrawPoints = () => {
    let canvas = document.querySelector("#canvas-annotation");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.beginPath();
    ctx.strokeStyle = "#f00";
    ctx.lineWidth = 2;
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 5;

    let drawX = (ANNOTATION_POINT_ONE.x/ANNOTATION_POINT_ONE.w)*canvas.width;
    let drawY = (ANNOTATION_POINT_ONE.y/ANNOTATION_POINT_ONE.h)*canvas.height;

    let drawW = ((ANNOTATION_POINT_TWO.x - ANNOTATION_POINT_ONE.x)/ANNOTATION_POINT_ONE.w)*canvas.width;
    let drawH = ((ANNOTATION_POINT_TWO.y - ANNOTATION_POINT_ONE.y)/ANNOTATION_POINT_ONE.h)*canvas.height;

    ctx.rect(drawX, drawY, drawW, drawH);
    ctx.stroke();
}

const renderSaveFile = (skipSave) => {
    if (!skipSave){
        let saveString = JSON.stringify(SAVEFILE);
        localStorage.setItem(LOCAL_STORAGE_KEY, saveString);
    }

    let canvas = document.querySelector("#canvas-img");
    let ctx = canvas.getContext("2d");

    let currentImage = SAVEFILE.images.filter((item)=>{return item.id === SAVEFILE.mainId})[0];
    document.querySelector("#annotation-list").innerHTML = "";

    if (currentImage){
        let img = document.createElement("img");
        img.src = currentImage.path
        img.addEventListener('load', (e) => {
            let allCanvas = document.querySelectorAll("canvas");
            for (let i = 0; i < allCanvas.length; i++) {
                const c = allCanvas[i];
                c.width = e.target.naturalWidth
                c.height = e.target.naturalHeight
            }
           
            ctx.drawImage(img, 0, 0);
        });
    
        let annotationList = document.querySelector("#annotation-list");
    
        currentImage.annotations.forEach((item, index)=>{
            let annotationBox = document.createElement("div");
            annotationBox.className = "annotation-box";
    
            annotationBox.style.left = (item.x1 * 100) + "%";
            annotationBox.style.top = (item.y1 * 100) + "%";
            annotationBox.style.width = ((item.x2 - item.x1) * 100) + "%";
            annotationBox.style.height = ((item.y2 - item.y1)* 100) + "%";
            annotationBox.style.border = `2px solid ${item.color}`;
            annotationBox.innerHTML = `<div class="annotation-box-inner" style="background-color:${item.color}"></div><div class="annotation-box-comment"><span style="background-color:#fff">${item.comment}</span></div><div class="annotation-box-delete" onclick="deleteAnnotationTextBox(${index})">X</div>`;
    
            annotationList.appendChild(annotationBox)
        })
    } else {
        let allCanvas = document.querySelectorAll("canvas");
        for (let i = 0; i < allCanvas.length; i++) {
            const c = allCanvas[i];
            c.width = "300"
            c.height = "150"
        }

        ctx.clearRect(0,0,canvas.width,canvas.height);
    }

    let galleryContainer = document.querySelector("#gallery-container");
    galleryContainer.innerHTML = "";

    SAVEFILE.images.forEach((item, index)=>{
        let galleryImage = document.createElement("div");
        galleryImage.className = item.id === SAVEFILE.mainId ? "gallery-img active" : "gallery-img";
        galleryImage.style.backgroundImage = `url(${item.path})`;

        galleryImage.addEventListener('click', (e) => {
            switchImage(index, true)
        });

        galleryContainer.appendChild(galleryImage)
    })

    let ci = getCurrentImageIndex();
    document.querySelector("#btn-next").className = !SAVEFILE.images[ci + 1] ? "custom-file-upload disabled" : "custom-file-upload";
    document.querySelector("#btn-prev").className = !SAVEFILE.images[ci - 1] ? "custom-file-upload disabled" : "custom-file-upload";
}