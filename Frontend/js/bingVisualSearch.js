

            // Handles the user's file selection. The file input button specifies this handler.
            function handleFileSelect(selector) {
                var files = document.getElementById(selector).files; // FileList object

                // The list will contain only one file.
                for (var i = 0, f; f = files[i]; i++) {
        
                    // Only process image files.
                    if (!f.type.match('image.*')) {
                        alert("Debe seleccionar una imagen.");
                        document.getElementById("uploadImage").value = null;
                        continue;
                    }
        
                    // Image must be <= 1 MB and should be about 1500px.
                    if (f.size > 1000000) {
                        alert("La imagen debe pesar menos de un 1MB");
                        document.getElementById("uploadImage").value = null;
                        continue;
                    }


                    var reader = new FileReader();
        
                    // Capture the file information.
                    reader.onload = (function(theFile) {
                        return function(e) {
                            var fileOutput = document.getElementById('thumbnail');

                            if (fileOutput.childElementCount > 0) {
                                fileOutput.removeChild(fileOutput.lastChild);  // Remove the current pic, if it exists
                            }

                            // Render thumbnail.
                            var span = document.createElement('span');
                            span.innerHTML = ['<img class="thumb" src="', e.target.result,
                                            '" title="', escape(theFile.name), '"/>'].join('');
                            fileOutput.insertBefore(span, null);
                        };
                    })(f);
        
                    // Read in the image file as a data URL.
                    reader.readAsDataURL(f);
                }
            }


            // Contains the toggle state of divs.
            var divToggleMap = {};  // divToggleMap['foo'] = 0;  // 1 = show, 0 = hide


            // Toggles between showing and hiding the specified div.
            function expandCollapse(divToToggle) {
                var div = document.getElementById(divToToggle);

                if (divToggleMap[divToToggle] == 1) {   // if div is expanded
                    div.style.display = "none";
                    divToggleMap[divToToggle] = 0;
                }
                else {                                  // if div is collapsed
                    div.style.display = "inline-block";
                    divToggleMap[divToToggle] = 1;
                }
            }

            function makeblob (dataURL) {
                var BASE64_MARKER = ';base64,';
                if (dataURL.indexOf(BASE64_MARKER) == -1) {
                    var parts = dataURL.split(',');
                    var contentType = parts[0].split(':')[1];
                    var raw = decodeURIComponent(parts[1]);
                    return new Blob([raw], { type: contentType });
                }
                var parts = dataURL.split(BASE64_MARKER);
                var contentType = parts[0].split(':')[1];
                var raw = window.atob(parts[1]);
                var rawLength = raw.length;
    
                var uInt8Array = new Uint8Array(rawLength);
    
                for (var i = 0; i < rawLength; ++i) {
                    uInt8Array[i] = raw.charCodeAt(i);
                }
    
                return new Blob([uInt8Array], { type: contentType });
            }


            // Called when the user clicks the Query insights button.
            function handleQuery() {
                showWait();
                var subscriptionKey = document.getElementById('key').value;

                // Make sure user provided a subscription key and image.
                // For this demo, the user provides the key but typically you'd 
                // get it from secured storage.
                if (subscriptionKey.length !== 32) {
                    alert("La llave de Cognitive Services es inválida");
                    return;
                }


                var responseDiv = document.getElementById('responseSection');

                // Clear out the response from the last query.
                while (responseDiv.childElementCount > 0) {
                    responseDiv.removeChild(responseDiv.lastChild);
                }

                // Send the request to Bing to get insights about the image.
                var imagePath = document.getElementById('uploadImage');
                var canvas = document.getElementById    ("canvas");
                canvas.width = imagePath.width;
                canvas.height = imagePath.height;
                var ctx = canvas.getContext("2d");

                ctx.drawImage(imagePath, 0,0, imagePath.width, imagePath.height);
                        
                sendRequest(makeblob(canvas.toDataURL('image/png')), subscriptionKey);

            }

            function sendRequest2(insightsToken, subscriptionKey){
                let visualSearchBaseURL = 'https://eastus.api.cognitive.microsoft.com/bing/v7.0/images/visualsearch/?mkt=en-us',
                    boundary = 'boundary_ABC123DEF456',
                    startBoundary = '--' + boundary,
                    endBoundary = '--' + boundary + '--',
                    newLine = "\r\n",
                    bodyHeader = 'Content-Disposition: form-data; name="knowledgeRequest"' + newLine + newLine;

                let postBody = {
                    imageInfo: {
                        imageInsightsToken: insightsToken
                    }
                }
                let requestBody = startBoundary + newLine;
                requestBody += bodyHeader;
                requestBody += JSON.stringify(postBody) + newLine + newLine;
                requestBody += endBoundary + newLine;

                let request = new XMLHttpRequest();

                try {
                    request.open("POST", visualSearchBaseURL);
                } 
                catch (e) {
                    renderErrorMessage("Error performing visual search: " + e.message);
                }
                request.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
                request.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundary);
                request.addEventListener("load", handleResponse2);
                request.send(requestBody);
            }


            // Format the request and send it.
            function sendRequest(file, key) {
                var market = "en-us";
                var safeSearch = "Off";
                var baseUri = `https://eastus.api.cognitive.microsoft.com/bing/v7.0/images/visualsearch/?mkt=en-us`;

                var form = new FormData();
                form.append("image", file);

                var request = new XMLHttpRequest();

                request.open("POST", baseUri);
                request.setRequestHeader('Ocp-Apim-Subscription-Key', key);
                request.setRequestHeader('BingAPIs-Market', 'en-US');
                request.addEventListener('load', handleResponse);
                request.send(form);
            }


            // Handles the response from Bing. Parses the response and 
            // the tag divs.
            function handleResponse() {
                if(this.status !== 200){
                    alert("Error calling Bing Visual Search. See console log for details.");
                    console.log(this.responseText);
                    return;
                }
                console.log(this.responseText.match(/"imageInsightsToken": "[a-zA-Z0-9_\*\.]+",/g, '')); /// muestra todos los tokens a buscar en sendRequest 2

                clearItems(); // elimina resultados anteriores

                var subscriptionKey = document.getElementById('key').value;
                this.responseText.match(/"imageInsightsToken": "[a-zA-Z0-9_\*\.]+",/g, '').forEach( element => {
                    sendRequest2(element.split("\"")[3], subscriptionKey);
                    hideWait(); return; // solo una iteracion.
                })
            }

            // Handles the response from Bing. Parses the response and 
            // the tag divs.
            function handleResponse2() {
                if(this.status !== 200){
                    alert("Error calling Bing Visual Search. See console log for details.");
                    console.log(this.responseText);
                    return;
                }

                var tags = parseResponse(JSON.parse(this.responseText));
                
                buildTagSections(tags);
                document.body.style.cursor = 'default'; // reset the wait curor set by query insights button
            }


            // Parses the json response by tags.
            function parseResponse(json) {
                var dict = {};

                for (var i =0; i < json.tags.length; i++) {
                    var tag = json.tags[i];
                
                    if (tag.displayName === '') {
                        dict['Default'] = JSON.stringify(tag);
                    }
                    else {
                        dict[tag.displayName] = JSON.stringify(tag);
                    }
                }

                return(dict);
            }


            // Builds divs fro each tag in the response.
            function buildTagSections(tags) {
                for (var tag in tags) {
                    if (tags.hasOwnProperty(tag)) {
                        var tagSection = buildDiv(tags, tag);
                        document.getElementById('responseSection').appendChild(tagSection);
                    }
                } 
                
            }


            // Builds the div for the specified tag. The div is shown as a
            // link that when clicked, expands or collapses. The divs are 
            // initially collapsed.
            function buildDiv(tags, tag) {
                var tagSection = document.createElement('div');
                tagSection.setAttribute('class', 'subSection');

                
                var contentDiv = document.createElement('div');
                contentDiv.setAttribute('id', tag);
                contentDiv.setAttribute('style', 'clear: left;')
                contentDiv.setAttribute('class', 'section');
                tagSection.appendChild(contentDiv);

                addDivContent(contentDiv, tag, tags[tag]);

                return tagSection;
            }


            // Adds the tag's action types to the div.
            function addDivContent(div, tag, json) {
                
                var parsedJson = JSON.parse(json);
                // Loop through all the actions in the tag and display them.
                for (var j = 0; j < parsedJson.actions.length; j++) {
                    var action = parsedJson.actions[j];

                    

                    /*if (action.actionType === 'PagesIncluding') {
                        var subSectionDiv = document.createElement('div');
                        subSectionDiv.setAttribute('class', 'subSection');
                        div.appendChild(subSectionDiv);

                        var h4 = document.createElement('h4');
                        h4.innerHTML = "Distribuidores";
                        subSectionDiv.appendChild(h4);
                        addPagesIncluding(subSectionDiv, action.data.value);
                    }
                    else */
                    if (action.actionType === 'ShoppingSources') {
                        
                        console.log("------", parsedJson);
                        var subSectionDiv = document.createElement('div');
                        subSectionDiv.setAttribute('class', 'subSection');
                        div.appendChild(subSectionDiv);

                        addShopping(subSectionDiv, action.data.offers, parsedJson.actions[j+1].image.thumbnailUrl, parsedJson.actions[j+1].datePublished);
                    }
                }
            }

            // Display links to the first 5 webpages that include the image.
            // TODO: Add 'more' link in case the user wants to see all of them.
            function addPagesIncluding(div, pages) {
                var length = pages.length;

                for (var j = 0; j < length; j++) {
                    var page = document.createElement('a');
                    page.text = pages[j].name;
                    page.setAttribute('href', pages[j].hostPageUrl);
                    page.setAttribute('style', 'margin: 20px 20px 0 0');
                    page.setAttribute('target', '_blank')
                    div.appendChild(page);

                    div.appendChild(document.createElement('br'));
                }
            }

            // Display links for the first 10 shopping offers.
            // TODO: Add 'more' link in case the user wants to see all of them.
            function addShopping(div, offers, image, date) {
                var length = (offers.length > 10) ? 10 : offers.length;

                for (var j = 0; j < length; j++) {

                    //div.appendChild(para);
                    console.log ({ 
                        "offerName" : offers[j].name,
                        "offerLink" :  offers[j].url,
                        "image" : image,
                        "sellerLogo" : offers[j].seller.image,
                        "sellerName" : offers[j].seller.name,
                        "price" : offers[j].price,
                        "currency" : offers[j].priceCurrency
                    });

                    addItemRow({ 
                        "offerName" : offers[j].name,
                        "offerLink" :  offers[j].url,
                        "image" : image,
                        "sellerLogo" : offers[j].seller.image,
                        "sellerName" : offers[j].seller.name,
                        "price" : offers[j].price,
                        "currency" : offers[j].priceCurrency
                    })
                }
            }


            // Display the first 10 related products. Display a clickable image of the 
            // product that takes the user to Bing.com search results for the product.
            // If there are any offers associated with the product, provide links to the offers.
            // TODO: Add 'more' link in case the user wants to see all of them.
            function addProducts(div, products) {
                var length = (products.length > 10) ? 10 : products.length;

                for (var j = 0; j < length; j++) {
                    var childDiv = document.createElement('div');
                    childDiv.setAttribute('class', 'stackLink');
                    div.appendChild(childDiv);

                    var img = document.createElement('img');
                    img.setAttribute('src', products[j].thumbnailUrl + '&w=120&h=120');
                    img.setAttribute('title', products[j].name);
                    img.setAttribute('style', 'margin: 20px 20px 0 0; cursor: pointer;');
                    img.setAttribute('data-webSearchUrl', products[j].webSearchUrl)
                    img.addEventListener('click', function(e) {
                        var url = e.target.getAttribute('data-webSearchUrl');
                        window.open(url, 'foo');
                    })
                    childDiv.appendChild(img);

                    if (products[j].insightsMetadata.hasOwnProperty('aggregateOffer')) {
                        if (products[j].insightsMetadata.aggregateOffer.offerCount > 0) {
                            var offers = products[j].insightsMetadata.aggregateOffer.offers;

                            // Show all the offers. Not all markets provide links to offers.
                            for (var i = 0; i < offers.length; i++) {  
                                var para = document.createElement('p');

                                var offer = document.createElement('a');
                                offer.text = offers[i].name;
                                offer.setAttribute('href', offers[i].url);
                                offer.setAttribute('style', 'margin: 20px 20px 0 0');
                                offer.setAttribute('target', '_blank')
                                para.appendChild(offer);

                                var span = document.createElement('span');
                                span.textContent = 'by ' + offers[i].seller.name + ' | ' + offers[i].price + ' ' + offers[i].priceCurrency;
                                para.appendChild(span);

                                childDiv.appendChild(para);
                            }
                        }
                        else {  // Otherwise, just show the lowest price that Bing found.
                            var offer = products[j].insightsMetadata.aggregateOffer;

                            var para = document.createElement('p');
                            para.textContent = `${offer.name} | ${offer.lowPrice} ${offer.priceCurrency}`; 

                            childDiv.appendChild(para);
                        }
                    }
                }
            }


            // If Bing recognized any text in the image, display the text.
            function addTextResult(div, action) {
                var text = document.createElement('p');
                text.textContent = action.displayName;
                div.appendChild(text);
            }


            // If the image is of a person, the tag might include an entity
            // action type. Display a link that takes the user to Bing.com
            // where they can get details about the entity.
            function addEntity(div, action) {
                var entity = document.createElement('a');
                entity.text = action.displayName;
                entity.setAttribute('href', action.webSearchUrl);
                entity.setAttribute('style', 'margin: 20px 20px 0 0');
                entity.setAttribute('target', '_blank');
                div.appendChild(entity);
            }


            // Adds a clickable image to the div that takes the user to
            // Bing.com search results.
            function addImageWithWebSearchUrl(div, image, action) {
                var img = document.createElement('img');
                img.setAttribute('src', image.thumbnailUrl + '&w=120&h=120');
                img.setAttribute('style', 'margin: 20px 20px 0 0; cursor: pointer;');
                img.setAttribute('data-webSearchUrl', action.webSearchUrl);
                img.addEventListener('click', function(e) {
                    var url = e.target.getAttribute('data-webSearchUrl');
                    window.open(url, 'foo');
                })
                div.appendChild(img);
            }

        