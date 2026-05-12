const params = new URLSearchParams(window.location.search);

const id = params.get('id');

const article = articleData[id];

if(article){

    document.getElementById('title').innerText =
    article.title;

    document.getElementById('image').src =
    article.image;

    document.getElementById('category').innerText =
    article.category;

    document.getElementById('date').innerText =
    article.date;

    document.getElementById('views').innerText =
    article.views;

    document.getElementById('content').innerHTML =
    article.content;

}
