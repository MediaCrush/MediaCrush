thingiurlbase = null;

ThreeDeePlayer = (containerid) ->
    view = new Thingiview(containerid)
    console.log(view)

    view.setRotation(false)
    view.setObjectColor("#005580")
    view.setBackgroundColor("#fff")
    view.setShowPlane(false)
    view.initScene()

    container = document.getElementById(containerid)
    view.loadSTL(container.dataset.object)

window.ThreeDeePlayer = ThreeDeePlayer
