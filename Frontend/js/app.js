

$('#camera').hide();


$('#takeImage').click(function(){
    $('#main').fadeOut(400);
    $('#camera').fadeIn(400);
    start(); // camera.js -> start

});

// cambiar la camara del usuario
$('#changeCamera').click(function(){
    start(); // camera.js -> start

    if($('#cameraIcon').html() == 'camera_front'){
        $('#cameraIcon').fadeOut(400, function(){
            $('#cameraIcon').html('camera_rear');
            $('#cameraIcon').fadeIn(400);
        });
    }else{
        $('#cameraIcon').fadeOut(400, function(){
            $('#cameraIcon').html('camera_front') ;
            $('#cameraIcon').fadeIn(400);
        });

    }
}); 

///colocar la imagen del stream en div:preview 
$('#cameraIcon').click(function(){
    $video = document.querySelector('video');
    $video.pause();

    //Obtener contexto del canvas y dibujar sobre él
    $canvas = document.querySelector('canvas')
    let contexto = $canvas.getContext("2d");
    $canvas.width = $video.videoWidth;
    $canvas.height = $video.videoHeight;
    contexto.drawImage($video, 0, 0, $canvas.width, $canvas.height);

    $('#camera').fadeOut(500);
    $('#main').fadeIn(500);

    stop();

    filePreviewCanvas($canvas);
    
});

/// buscar
$('#buscar').click(function(){
    try {
        handleQuery();
        updateStats(1,0,0); // aumenta las busquedas en 1
        $("#calificar").show(); //muestra seccion calificar
    } catch (error) {
        alert("Debe seleccionar una imagen.")
        hideWait();
        $("#calificar").hide();
    }   
});

/// actualizar nombre de input file
// generar preview

$('input[type=file]').change(function(){
    if(!$(this).val()){
        //$(this).html('Cargar Imagen');
    }else{
        console.log(this);
        $('#imageName').html($(this).val().split('\\').pop());
        filePreview(this);
    }
});


function filePreview(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#preview img').remove();
            $('#preview').append('<img id="uploadImage" src="'+e.target.result+'" width="100%" />');
            $('#preview img').fadeIn(500);

        }
        reader.readAsDataURL(input.files[0]);
    }
}

function filePreviewCanvas(canvas){
    $('#preview img').remove();
    $('#preview').append('<img id="uploadImage" src="'+canvas.toDataURL()+'" width="100%" />');
    $('#preview img').fadeIn(1000);
}


function clearItems(){
    $("#results tbody").empty();
}

function addItemRow(offer){
    let datatable = $("#results tbody");

    var link = `<a href="${offer.offerLink}" target="_blank">${offer.offerName}</a>`;
    
    var img = `<img src="${offer.image}" alt="" width="200">`;

    datatable.append(`
            <tr>
            <td>${img}</td>
            <td>${link}</td>
            <td>${offer.sellerName}</td>
            <td>${offer.price}</td>
            <td>${offer.currency}</td>
            </tr>
    `)
}

$(document).ready(function(){
    $('#load').hide();

    $('#identificate').click(login)

    $('#enviarCalificacion').click(calificar)

    $("#calificar").hide();

    
    $('#error-contrasena').hide();

    $('#welcome').hide();

});

function showWait(){
    $('#load').show();
}

function hideWait(){
    $('#load').hide();
}

function verificarFormulario(){
    if($("#usuario").val() && $("#contrasena").val()){
        $('#error-contrasena').hide();
        return true;
    }
    $('#error-contrasena').show();
    return false;
}

function login(){
    if(verificarFormulario()){
        usuario = $("#usuario").val()
        contrasea = $("#contrasena").val()
        $('#error-contrasena').hide();
        checkUser(usuario, contrasea)
    }
}

function calificar(){
    valorCalificacion  = $("#calificacionValor").val()
    if (!valorCalificacion || valorCalificacion < 0){
        $("#calificar").hide()
        return
    }

    updateStats(0, 1, parseInt(valorCalificacion));

    $("#calificar").hide();
    getStats();
}



function sortTableByNumber(n, elem, title) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("results");
    switching = true;
    // Set the sorting direction to ascending:
    dir = "asc";
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
      // Start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /* Loop through all table rows (except the
      first, which contains table headers): */
      for (i = 1; i < (rows.length - 1); i++) {
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Get the two elements you want to compare,
        one from current row and one from the next: */
        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        /* Check if the two rows should switch place,
        based on the direction, asc or desc: */
        if (dir == "asc") {
          if (Number(x.innerHTML) > Number(y.innerHTML)) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (Number(x.innerHTML) < Number(y.innerHTML)) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        // Each time a switch is done, increase this count by 1:
        switchcount ++;
      } else {
        /* If no switching has been done AND the direction is "asc",
        set the direction to "desc" and run the while loop again. */
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
    if(dir == "asc"){
      elem.innerHTML = title + " ↑";
    }else{
      elem.innerHTML = title + " ↓";
    }
  }

  function sortTableByText(n, elem, title) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("results");
    switching = true;
    // Set the sorting direction to ascending:
    dir = "asc";
    /* Make a loop that will continue until
    no switching has been done: */
    

    while (switching) {
      // Start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /* Loop through all table rows (except the
      first, which contains table headers): */
      for (i = 1; i < (rows.length - 1); i++) {
        // Start by saying there should be no switching:
        shouldSwitch = false;
        /* Get the two elements you want to compare,
        one from current row and one from the next: */
        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        /* Check if the two rows should switch place,
        based on the direction, asc or desc: */
        if (dir == "asc") {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            // If so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        /* If a switch has been marked, make the switch
        and mark that a switch has been done: */
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        // Each time a switch is done, increase this count by 1:
        switchcount ++;
      } else {
        /* If no switching has been done AND the direction is "asc",
        set the direction to "desc" and run the while loop again. */
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }

    if(dir == "asc"){
      elem.innerHTML = title + " ↑";
    }else{
      elem.innerHTML = title + " ↓";
    }
  }