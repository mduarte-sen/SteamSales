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
let gamesPerPage = 10;
let initialShownGames = [0,10];

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

function compare( a, b ) {
    if ( a.title < b.title ){
      return -1;
    }
    if ( a.title > b.title ){
      return 1;
    }
    return 0;
  }

function appendSalesList(){
    let currentPage = salesArray.slice(...initialShownGames);
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
    let pageSelectionArray = pageListing();
    for(let i=0; i<pageSelectionArray.length; i++){
        paginationToAppend += `<li class="page-item" id="page-item${i}">
                                    <a class="page-link page-selection" href="#" id="select-page${i}">${i+1}</a>
                                </li>`;
        $(document).on("click", `#select-page${i}`, function(){
            displayPageNo = i;
            initialShownGames = pageSelectionArray[displayPageNo];
            appendSalesList();
            markCurrentPage();
        }); 
    };
    $(document).on("click", `#previous-item`, function(){
        if(displayPageNo > 0){
            displayPageNo--;
            initialShownGames = pageSelectionArray[displayPageNo];
            appendSalesList();
            markCurrentPage()
        };
    });
    $(document).on("click", `#next-item`, function(){
        if(displayPageNo < salesArray.length){
            displayPageNo++;
            initialShownGames = pageSelectionArray[displayPageNo];
            appendSalesList();
            markCurrentPage()
        };
    });
    $('#arrow-prev').after(paginationToAppend);
    markCurrentPage();
};

function pageListing(){
    let finalPageListing = [];
    let numberOfPages = Math.ceil(salesArray.length / gamesPerPage);

    for(let i=0; i < numberOfPages; i++){
        let insertPageListing = [initialShownGames[0] + 10*i, initialShownGames[1] + 10*i];
        finalPageListing.push(insertPageListing);
    }
    return finalPageListing;
};

function valueRevSteam(review){
    switch(review){
        case 'Overwhelmingly Positive':
            return 4;
        case 'Mostly Positive':
            return 3;
        case 'Very Positive':
            return 2;
        case 'Positive':
            return 1;
        case 'Mixed':
            return 0;
        case 'Negative':
            return -1;
        case 'Very Negative':
            return -2;
        case 'Mostly Positive':
            return -3;
        case 'Overwhelmingly Negative':
            return -4;
        default:
            return -5;
    };
};

function isNumberKey(evt){
    var charCode = evt.which;
    if (charCode > 31 && (charCode < 48 || charCode > 57)){
        return false;
    }
    if(evt.srcElement.value + evt.key > 100 && (evt.srcElement.name == 'maxDisc' || evt.srcElement.name == 'minDisc')){
        return false;
    }
    return true;
};



$(document).ready(function(){
    getJSONData(salesUrl).then(
        function(resultObj){
            if(resultObj.status === 'ok'){
                salesArray = resultObj.data;
                vanillaSalesArray = resultObj.data;
        }}).then( function(){
            $(".filter-number").keypress(function(){return isNumberKey(event)});
            $("#sales-filter").submit(function(){
                $(this).find('input').filter(function(){
                    return !this.value;
                }).prop('name', '');
            })
            console.log(salesArray)
            if(params.has('orderBy')){
                switch(params.get('orderBy')){
                    case 'default':
                        salesArray = vanillaSalesArray;
                        break;
                    case 'alph':
                        salesArray.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0));
                        break;
                    case 'priceAsc':
                        salesArray.sort((a,b) => (a.salePrice > b.salePrice) ? 1 : ((b.salePrice > a.salePrice) ? -1 : 0));
                        break;
                    case 'priceDes':
                        salesArray.sort((a,b) => (a.salePrice < b.salePrice) ? 1 : ((b.salePrice < a.salePrice) ? -1 : 0));
                        break;
                    case 'discAsc':
                        salesArray.sort((a,b) => (a.savings > b.savings) ? 1 : ((b.savings > a.savings) ? -1 : 0));
                        break;
                    case 'discDes':
                        salesArray.sort((a,b) => (a.savings < b.savings) ? 1 : ((b.savings < a.savings) ? -1 : 0));
                        break;
                    case 'revSteam':
                        salesArray.sort((a,b) => (valueRevSteam(a.steamRatingText) < valueRevSteam(b.steamRatingText)) ? 1 : ((valueRevSteam(b.steamRatingText) < valueRevSteam(a.steamRatingText)) ? -1 : 0));
                        break;
                    case 'revMeta':
                        salesArray.sort((a,b) => (a.metacriticScore < b.metacriticScore) ? 1 : ((b.metacriticScore < a.metacriticScore) ? -1 : 0));
                        break;
                };
            };
            if(params.has('minPrice') && params.has('maxPrice')){
                salesArray = salesArray.filter((games) => games.salePrice >= parseInt(params.get('minPrice')) && games.salePrice <= parseInt(params.get('maxPrice')))
            }
            if(params.has('minDisc') && params.has('maxDisc')){
                salesArray = salesArray.filter((games) => games.savings >= parseInt(params.get('minDisc')) && games.savings <= parseInt(params.get('maxDisc')))
            }
            appendPagination();
            appendSalesList();
    });
});