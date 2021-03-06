import axios from 'axios';
import { $ } from './bling';

const counter = $('.heart-count');

function ajaxHeart(e) {
    e.preventDefault();

    console.log('hearted');

    axios.post(this.action)
        .then(res => {
            console.log(res.data);
            const isHearted = this.heart.classList.toggle('heart__button--hearted');
            counter.textContent = res.data.hearts.length;
            if (isHearted) {
                this.heart.classList.add('heart__button--float');
                setTimeout(() => this.heart.classList.remove('heart__button--float'), 2500);
            }

        })
        .catch(err => console.error(err));

    return false;
}

export default ajaxHeart;