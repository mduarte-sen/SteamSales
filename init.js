const DEAL_REDIRECT = "https://www.cheapshark.com/redirect?dealID="; //attach deal ID
const STEAM_DEALS = "https://www.cheapshark.com/api/1.0/deals?storeID=1";

let salesArray = [];

var getJSONData = function(url){
    var result = {};
    return fetch(url).then(response => {
        if(response.ok){
            return response.json();
        } else {
            throw Error(response.statusText);
        }
    }).then(function(response){
        result.status = 'ok';
        result.data = response;
        return result;
    }).catch(function(error){
        result.status = 'error';
        result.data = error;
        return result;
    });
}




$(document).ready(function(){
let contentToAppend = ``;
    getJSONData(STEAM_DEALS + '&onSale&pageSize=10').then(
        function(resultObj){
            if(resultObj.status === 'ok'){
            salesArray = resultObj.data;
            console.log(salesArray);
        }
    }).then( function(){
        for(let i=0; i<salesArray.length; i++){
        contentToAppend += `<div class="row">
                                <div class="row">
                                    <div class="h5">${salesArray[i].title}</div>
                                </div>
                                <div class="row">
                                    <div class="col-4"><img src="${salesArray[i].thumb}"></div>
                                    <div class="col">
                                        <div class="row">
                                            <div class="col-6">${salesArray[i].normalPrice}</div>
                                            <div class="col-6">${salesArray[i].metacriticScore}</div>
                                        </div>
                                        <div class="row">
                                            <div class="col-6">${salesArray[i].salePrice}</div>
                                            <div class="col-6">${salesArray[i].steamRatingText}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
        $('#deal-show').html(contentToAppend);
        }
    });
});
