'use strict';
//обработчик событий,который отслеживает загрузку контента
document.addEventListener('DOMContentLoaded',function(){
    const btnOpenModal = document.querySelector('#btnOpenModal');
    const modalBlock = document.querySelector('#modalBlock');
    const modalWrap = document.querySelector(".modal");
    const closeModal = document.querySelector('#closeModal');
    const questionTitle = document.querySelector('#question');
    const formAnswers = document.querySelector('#formAnswers');
    const burgerBtn = document.getElementById("burger");
    const nextButton = document.querySelector('#next');
    const prevButton = document.querySelector('#prev');
    const modalDialog = document.querySelector(".modal-dialog");
    const sendButton = document.querySelector('#send');
    const modalTitle = document.querySelector('.modal-title');

    const firebaseConfig = {
        apiKey: "AIzaSyBxPifyCROFzz8NSIRYnm-vUa5Dhn_VI6E",
        authDomain: "quizburger-99bbe.firebaseapp.com",
        databaseURL: "https://quizburger-99bbe.firebaseio.com",
        projectId: "quizburger-99bbe",
        storageBucket: "quizburger-99bbe.appspot.com",
        messagingSenderId: "458153185762",
        appId: "1:458153185762:web:ecdd33cd344ab77f55e9bb",
        measurementId: "G-KM0FQTNQ5L"
      };
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
    


    //функция получения данных
    const getData = () =>{
        formAnswers.textContent = 'LOAD';

        nextButton.classList.add('d-none')
        prevButton.classList.add('d-none');
        
        setTimeout(()=>{
            firebase.database().ref().child('questions').once('value')
            .then(snap => playTest(snap.val()))
        },500);
        
    }
    

    let count = -100;
    modalDialog.style.top = count + "%";
    const animateModal = () =>{
        modalDialog.style.top = count + "%";
        count += 3; 
        if(count < 0){
            requestAnimationFrame(animateModal);
        }else{
            count = -100;
        }
    }
    

    let clientWidth = document.documentElement.clientWidth;
    
    if(clientWidth<768){
        burgerBtn.style.display = "flex";
    }else{
        burgerBtn.style.display = "none";
    }
    
    window.addEventListener("resize",function(){
        clientWidth = document.documentElement.clientWidth;
        if(clientWidth < 768){
            burgerBtn.style.display = "flex";
        }else{
            burgerBtn.style.display = "none";
        }
    });

    burgerBtn.addEventListener('click',function(){
        requestAnimationFrame(animateModal);
        burgerBtn.classList.add("active");
        modalBlock.classList.add('d-block');
        playTest();
        getData();
    });

    //обработчик событий открытия/закрытия модального окна
    btnOpenModal.addEventListener('click',() => {
        requestAnimationFrame(animateModal);
        modalBlock.classList.add('d-block');
        getData();
    });

    closeModal.addEventListener('click',function(){
        modalBlock.classList.remove('d-block');
        burgerBtn.classList.remove("active");
    });

    document.addEventListener('click',function(event){
        if(!event.target.closest('.modal-dialog') && 
        !event.target.closest('.openModalButton')&&
        !event.target.closest('.burger')){
            modalBlock.classList.remove('d-block');
            burgerBtn.classList.remove("active");
        }
    });
    //функиця запуска тестирования
    const playTest = function(questions){
        //переменная с номером вопроса
        const finalAnswers = [];
        const obj = {};
        let numberQuestion = 0;
        modalTitle.textContent = 'Ответь на вопрос:';

        //функция рендеринга ответа 
        const renderAnswers = (index) =>{
            questions[index].answers.forEach((answer) => {
                const answerItem = document.createElement('div');
                answerItem.classList.add('answers-item', 'd-flex', 'justify-content-center');
                
                answerItem.innerHTML = `
                <input type="${questions[index].type}" id="${answer.title}" name="answer" class="d-none" value="${answer.title}">
                <label for="${answer.title}" class="d-flex flex-column justify-content-between">
                  <img class="answerImg" src="${answer.url}" alt="burger">
                  <span>${answer.title}</span>
                </label>
                `;
                formAnswers.appendChild(answerItem);
                
            });
        }
        // функция рендеринга вопросов + ответов 
        const renderQuestions = (indexQuestion) =>{
            formAnswers.innerHTML = ``;
            
            if(numberQuestion >= 0 && numberQuestion <= questions.length-1){
                questionTitle.textContent = `${questions[indexQuestion].question}`;
                renderAnswers(indexQuestion);
                nextButton.classList.remove('d-none');
                prevButton.classList.remove('d-none');
                sendButton.classList.add('d-none');
            }
                
            if(numberQuestion === 0){
                prevButton.classList.add('d-none');
            }

            if(numberQuestion === questions.length){
                questionTitle.textContent = '';
                modalTitle.textContent = '';
                nextButton.classList.add('d-none')
                prevButton.classList.add('d-none');
                sendButton.classList.remove('d-none');
                formAnswers.innerHTML = `
                <div class="form-group">
                    <label for="numberPhone">Enter your phone number</label>
                    <input type="phone" class="form-control" id="numberPhone">
                </div>
                `;

                const numberPhone = document.getElementById("numberPhone");
                numberPhone.addEventListener('input',(event) => {
                    event.target.value = event.target.value.replace(/[^0-9+-]/,"");
                });
            }
            
            if(numberQuestion === questions.length+1){
                formAnswers.textContent = 'Спасибо за пройденный тест!';
                sendButton.classList.add('d-none');
                for(let key in obj){
                    let newObj = {};
                    newObj[key] = obj[key];
                    finalAnswers.push(newObj);
                }
                setTimeout(() => {
                    modalBlock.classList.remove('d-block');
                    burgerBtn.classList.remove("active");
                },2000);
            }
        }
        //запуск функций рендеринга
        renderQuestions(numberQuestion);

        const checkAnswer = () =>{
           
            const inputs = [...formAnswers.elements].filter((input) => input.checked || input.id === 'numberPhone');
            
            inputs.forEach((input, index) => {
                if(numberQuestion >= 0 && numberQuestion <= questions.length - 1){
                    obj[`${index}_${questions[numberQuestion].question}`] = input.value;
                }
                if(numberQuestion === questions.length){
                    obj['Phone number'] = input.value;
                }
            });

        }

        //обработчик событий кнопок next и prev
        nextButton.onclick = () => {
            checkAnswer();
            numberQuestion++;
            renderQuestions(numberQuestion);
        } 
        prevButton.onclick = () =>{
            numberQuestion--;
            renderQuestions(numberQuestion);
        }

        sendButton.onclick = () =>{
            checkAnswer();
            numberQuestion++;
            renderQuestions(numberQuestion);
            firebase
            .database()
            .ref()
            .child('contacts')
            .push(finalAnswers);
        }
    }

});
