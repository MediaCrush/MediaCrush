var pdfDocument = null;
function renderPage(pageNumber) {
    var canvas = document.createElement('canvas');
    canvas.id = 'page-' + pageNumber;
    canvas.className = 'pdf-canvas';
    var container = document.getElementById('container');
    container.appendChild(canvas);
    pdfDocument.getPage(pageNumber).then(function(page) {
        var w=window,d=document,e=d.documentElement,g=d.getElementsByTagName('body')[0],x=w.innerWidth||e.clientWidth||g.clientWidth,y=w.innerHeight||e.clientHeight||g.clientHeight;
        var viewport = page.getViewport(1);
        //canvas.height = viewport.height;
        //canvas.width = viewport.width;
        canvas.width = x * 0.9;
        var scale = (canvas.width / viewport.width);
        canvas.height = scale * viewport.height;
        viewport = page.getViewport(scale);
        var renderContext = {
            canvasContext: canvas.getContext('2d'),
            viewport: viewport
        };
        page.render(renderContext);
    });
}
PDFJS.getDocument(url).then(function(pdf) {
    pdfDocument = pdf;
    for (var i = 1; i < pdfDocument.numPages; i++) {
        renderPage(i);
    }
});
window.addEventListener('load', function() {
    var report = document.getElementById('report');
    report.addEventListener('click', function(e) {
        e.preventDefault();
        var report = document.getElementById('report');
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/report/' + location.href.split('/')[3]);
        xhr.send();
        report.parentNode.innerHTML = "Reported";
    }, false);
}, false);
