const queryBaseUrl = 'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles='
const searchBaseUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search='
const resultsLength = 10
const graphHeight = 600
const graphWidth = 800
const scale = 0.5
let totalCounts = {}
let currentPageCounts = {}
let sortedTotals = []
let sortedCurrent = []
let wikiScraped = false
let wikiSearched = false
let totalsCalculated = false
let currentRandomPage = null
let canvasesCreated = false
let firstSearch = true
let contentsCanvas = null
let resultsCanvas = null

var c = function(p) {
    p.setup = function() {
        p.createCanvas(graphWidth, graphHeight)
        p.background(0, 255, 255)
    }
}

var t = function(p) {
    p.setup = function() {
        p.createCanvas(graphWidth, graphHeight)
        p.background(0, 255, 255)
    }
}

function setup() {
    let input = select('#input')
    let results = select('#results')
    let contents = select('#contents')
    let contentsResults = select('#contentsResults')
    let randomPageLabel = select('#randomPageLabel')
    let randomPageContents = select('#randomPageContents')
}

function draw() {
    if (wikiScraped) {
        searchWiki()
        wikiScraped = false
    }
    if (wikiSearched) {
        currentPageCounts = {}
        calculateTotals()
        wikiSearched = false
    }
    if (totalsCalculated) {
        totalsCalculated = false
        if (firstSearch) {
            createCanvases()
            firstSearch = false
        }
        canvasesCreated = true
    }
    if (canvasesCreated) {
        canvasesCreated = false
        drawGraph(contentsCanvas, sortedCurrent)
        drawGraph(totalCanvas, sortedTotals)
    }
}

function formatUrl(url, action) {
    if (action === 'search') {
        return searchBaseUrl + url
    } else if (action === 'query') {
        return queryBaseUrl + url
    }
}

function scrapeWiki() {
    url = formatUrl(input.value, 'search')
    loadJSON(url, scrapeCallBack, 'jsonp')
}

function scrapeCallBack(response) {
    const randomIndex = Math.floor(Math.random() * response[1].length)
    randomPage = response[1][randomIndex]
    randomPageLabel.innerHTML = 'Random Page: ' + randomPage
    currentRandomPage = randomPage
    wikiScraped = true
}

function searchWiki() {
    url = formatUrl(currentRandomPage, 'query')
    loadJSON(url, searchCallBack, 'jsonp')
}

function searchCallBack(response) {
    let pages = response.query.pages
    let total_content = ''
    for (key in pages) {
        total_content += pages[key].revisions[0]['*'] + ' '
    }
    randomPageContents.innerHTML = total_content.replace(/[^\w\s]/gi, '')
    randomPageContents.hidden = false
    wikiSearched = true
}

function calculateTotals() {
    currentContents = sanitizeContents(randomPageContents.innerHTML)
    allWords = currentContents.split(' ')
    for (i in allWords) {
        word = allWords[i]
        if (word !== '') {
            if (totalCounts[word]) {
                totalCounts[word] += 1
            } else {
                totalCounts[word] = 1
            }

            if (currentPageCounts[word]) {
                currentPageCounts[word] += 1
            } else {
                currentPageCounts[word] = 1
            }
        }
    }
    sortedCurrent = sortProperties(currentPageCounts)
    sortedTotals = sortProperties(totalCounts)
    totalsCalculated = true
}

function sanitizeContents(contents) {
    contents = contents.replace(/(\r\n\t|\n|\r\t)/gm, '')
    contents = contents.trim()
    contents = contents.toLowerCase()
    return contents
}

function sortProperties(obj)
{
    let sortable=[];
    for(key in obj)
        if(obj.hasOwnProperty(key))
            sortable.push([key, obj[key]])

    sortable.sort(function(a, b)
    {
        return b[1]-a[1]
    })
    return sortable
}


function prepareResults(results) {
    results = results.slice(0, resultsLength)
    let obj = {}
    for (i in results) {
        key = results[i][0]
        value = results[i][1]
        obj[key] = value
    }
    return obj
}

function drawGraph(canvas, data) {
    canvas.background(0, 255, 255)
    let barWidth = (graphWidth / resultsLength) * 0.8
    let barMargin = (graphWidth / resultsLength) * 0.2
    let barHeight = data[0][1]

    canvas.push()
    canvas.textSize(14)
    canvas.translate(barMargin, 0)


    for (var i = 0; i < resultsLength; i++) {
        barHeight = data[i][1] * scale
        canvas.push()
        canvas.translate(i * (barWidth + barMargin), graphHeight - barHeight)
        canvas.rect(0, 0, barWidth, barHeight)
        canvas.text(data[i][0], 5, barWidth/2 + 5);
        canvas.pop()
    }
    canvas.pop()
}

function createCanvases() {
    contentsCanvas = new p5(c, 'contentsResults')
    totalCanvas = new p5(t, 'results')
}