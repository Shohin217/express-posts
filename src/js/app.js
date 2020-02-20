const apiUrl =  'https://shohin-express-api.herokuapp.com/api/posts';

const rootEl = document.querySelector('#root');

rootEl.innerHTML = `
    <label for="input_Name">Введите название поста:</label>
    <input type="text" id="input_Name" data-input="name_post">
    <button data-action="add_post">Добавить пост!</button>
    <button data-action="edit_post" style="display: none;">Изменить пост!</button>
    <img src="progress.gif" alt="progress" data-loading='progress'>
    <div style="color: red" data-error="error"></div>
`;
 
const listEl = document.createElement('ul');
rootEl.appendChild(listEl);

const inputName = rootEl.querySelector('[data-input=name_post]');
const btnAddPost = rootEl.querySelector('[data-action=add_post]');
const progress = rootEl.querySelector('[data-loading=progress]');
const btnEdditPost = rootEl.querySelector('[data-action=edit_post]');
const errorEl = rootEl.querySelector('[data-error=error]')

inputName.focus()

let post = [];
getAllPosts();

const language = 'ru'
const translations = {
    ru: {
        'error.not_found': 'Объект не найден',//OK
        'error.bad_request': 'Произошла ошибка, пожалуйста введите число', //OK
        'error.unknown': 'Произошла неизвестная ошибка', //OK
        'error.network': 'Проверьте своё соединение с интернетом', //OK
    },
    en: {
        'error.not_found': 'Object not found',
        'error.bad_request': 'Error occured',
        'error.unknown': 'Error occured',
        'error.network': 'Check internet connection',
    }
};
function translateError(code){
    return translations[language][code] || translations[language]['error.unknown'];
};
// counter -> +1
// loadend -> -1
// showLoader > 0
// hideLoader === 0
function getAllPosts (){
        const xhr = new XMLHttpRequest();
        xhr.open('GET', apiUrl);
        progress.style = "display: block;"
        xhr.addEventListener('load', evt => {
            listEl.innerHTML='';
            const response = xhr.responseText;
            if(xhr.status >= 200 && xhr.status < 300){
                post = JSON.parse(response);
                post.map(o=>{
                    const postEl = document.createElement('li');

                    postEl.innerHTML = `id: ${o.id}, пост: ${o.name}<button data-action="edit">Edit</button><button data-action="remove">X</button>`;
                    listEl.appendChild(postEl);

                    const btnEdit = postEl.querySelector('[data-action=edit]');

                    btnEdit.addEventListener('click', evt =>{
                        evt.preventDefault();
                        btnAddPost.style = "display: none";
                        btnEdditPost.style = "display: inline";
                        inputName.value = o.name
                        inputName.focus();
                        btnEdditPost.onclick = function(evt){
                            evt.preventDefault();
                            const nameValue = inputName.value;
                            const postForEddit = {id: o.id, name: nameValue};
                            editPost(postForEddit);
                            inputName.value = '';
                            btnAddPost.style = "display: inline";
                            btnEdditPost.style = "display: none";
                        }
                    })
                    const btnRm = postEl.querySelector('[data-action=remove]');
                    btnRm.addEventListener('click', evt =>{
                        evt.preventDefault();
                        removePost(o.id);
                    })
                    
                })
                console.log(post);
            }else{
                const {error} = JSON.parse(response);
                errorEl.innerText = translateError(error);
            }

        });

        xhr.addEventListener('error', evt => {
            errorEl.innerText = translateError('error.network');
        });

        xhr.addEventListener('loadend', () => {
            progress.style = "display: none;"
        });
        xhr.send();
}

function editPost (post){
    const xhr = new XMLHttpRequest();
    xhr.open('POST', apiUrl);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.addEventListener('load', evt=>{
        const response = xhr.responseText;
        if(xhr.status >= 200 && xhr.status < 300 ){
            getAllPosts();
            return;
        }
        const {error} = JSON.parse(response);
        errorEl.innerText = translateError(error);
    })
    xhr.addEventListener('error', evt => {
        errorEl.innerText = translateError('error.network');
    });
    xhr.send(JSON.stringify(post));
}

btnAddPost.addEventListener('click', evt =>{
    evt.preventDefault();
    const nameValue = inputName.value;
    addPost({id:0, name: nameValue});
    inputName.value = ''
})

function addPost (post){
    const xhr = new XMLHttpRequest();
    xhr.open('POST', apiUrl);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.addEventListener('load', evt =>{
        const response = xhr.responseText;
        if(xhr.status >= 200 && xhr.status < 300){
            getAllPosts();
            return;
        }
        const {error} = JSON.parse(response);
        errorEl.innerText = translateError(error);
    });
    xhr.addEventListener('error', evt => {
        errorEl.innerText = translateError('error.network');
    });
    xhr.send(JSON.stringify(post));
}


function removePost (postId){
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', `${apiUrl}/${postId}` );

    xhr.addEventListener('load', evt=>{
        const response = xhr.responseText;
        if(xhr.status >= 200 && xhr.status < 300){
                getAllPosts();
                return;
            }
        const {error} = JSON.parse(response);
        errorEl.innerText = translateError(error);
    });
    xhr.addEventListener('error', evt => {
        errorEl.innerText = translateError('error.network');
    });
    xhr.send();
} 