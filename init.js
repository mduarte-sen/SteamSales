const DEAL_REDIRECT = "https://www.cheapshark.com/redirect?dealID="; //attach deal ID
const STEAM_DEALS = "https://www.cheapshark.com/api/1.0/deals?storeID=1";
const PAGE_NUMBER = "&pageNumber=";
const PAGE_SIZE = "&pageSize=60";
const SORT_BY = "&sortBy="; //possible values: Deal Rating,Title, Savings, Price, Metacritic, Reviews, Release, Store, recent
const DESC = "&desc";
const LOWER_PRICE = "&lowerPrice=";
const UPPER_PRICE = "&upperPrice=";
const METACRITIC = "&metacritic=";
const STEAM_RATING = "&steamRating=";
const STEAMAPP_ID = "&steamAppID=";
const TITLE = "&title=";
const EXACT = "&exact="; //Flag to allow only exact string match for "title" parameter
const AAA = "&AAA="; //Flag to include only deals with retail price > $29
const ON_SALE = "&onSale=";

let salesUrl = STEAM_DEALS + ON_SALE + (STEAM_RATING + '1');

let vanillaSalesArray = [];
let salesArray = [];
let displayPageNo = 0;
let contentToAppend = ``;
let paginationToAppend = ``;
let shownGames = [0,10];

let params = (new URL(window.location)).searchParams;

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


function appendSalesList(){
    let currentPage = salesArray.slice(...shownGames);
    contentToAppend = "";
    for(let i=0; i<currentPage.length; i++){
        if(currentPage[i].steamRatingText == null){
            currentPage[i].steamRatingText = "No reviews";
        }
        contentToAppend += `<li class="list-group-item"><div class="row">
                                <div class="row">
                                    <div class="h4"><a href="${DEAL_REDIRECT+currentPage[i].dealID}">${currentPage[i].title}</a></div>
                                </div>
                                <div class="row">
                                    <div class="col-3"><img alt="game-logo" src="${currentPage[i].thumb}"></div>
                                    <div class="col">
                                        <div class="row">
                                            <div class="col-6">Normal price: $${currentPage[i].normalPrice}</div>
                                            <div class="col-6">Metacritic score: ${currentPage[i].metacriticScore}</div>
                                        </div>
                                        <div class="row">
                                            <div class="col-6">Sale price: $${currentPage[i].salePrice} (-${Math.floor(currentPage[i].savings)}%)</div>
                                            <div class="col-6">Steam review: ${currentPage[i].steamRatingText}</div>
                                        </div>
                                    </div>
                                </div>
                            </div></li>`;
    };
        $('#deal-show').html(contentToAppend);
};

function markCurrentPage(){
    if($('.page-item').hasClass('active')){
        $('.page-item').removeClass('active');
    }
    $('#page-item'+displayPageNo).addClass('active');
};

function appendPagination(){
    let pageSelectionArray = [[0,10], [10,20], [20,30], [30,40], [40,50], [50,60]];
    for(let i=0; i<pageSelectionArray.length; i++){
        paginationToAppend += `<li class="page-item" id="page-item${i}">
                                    <a class="page-link page-selection" href="#" id="select-page${i}">${i+1}</a>
                                </li>`;
        $(document).on("click", `#select-page${i}`, function(){
            displayPageNo = i;
            shownGames = pageSelectionArray[displayPageNo];
            appendSalesList();
            markCurrentPage();
        }); 
    };
    $(document).on("click", `#previous-item`, function(){
        if(displayPageNo > 0){
            displayPageNo--;
            shownGames = pageSelectionArray[displayPageNo];
            appendSalesList();
            markCurrentPage()
        };
    });
    $(document).on("click", `#next-item`, function(){
        if(displayPageNo < salesArray.length){
            displayPageNo++;
            shownGames = pageSelectionArray[displayPageNo];
            appendSalesList();
            markCurrentPage()
        };
    });
    $('#arrow-prev').after(paginationToAppend);
    markCurrentPage();
};


if(params.has('orderBy')){
    switch(params.get('orderBy')){
        case 'default':
            salesArray = vanillaSalesArray;
            break;
        case asd:
    };
}


$(document).ready(function(){
    getJSONData(salesUrl).then(
        function(resultObj){
            if(resultObj.status === 'ok'){
                salesArray = resultObj.data;
                vanillaSalesArray = resultObj.data;
        }}).then( function(){
            appendPagination();
            appendSalesList();
    });
});