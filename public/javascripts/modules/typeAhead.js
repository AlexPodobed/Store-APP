import axios from 'axios';
import dompurify from 'dompurify';

import { debounce } from './utils';

function searchResultsHTML(stores) {
    return stores.map(store => {
        return `
            <a href="/store/${store.slug}" class="search__result">
                <strong>${store.name}</strong>
            </a>
        `
    }).join('');
}

function typeAhead(search) {
    if (!search) return;

    const searchInput = search.querySelector('input[name="search"]');
    const searchResult = search.querySelector('.search__results');


    function performSearch() {
        if (!this.value) {
            searchResult.style.display = 'none';
            return;
        }

        searchResult.style.display = 'block';
        searchResult.innerHTML = '';

        axios.get(`/api/search?q=${this.value}`)
            .then(res => {
                if (res.data.length) {
                    searchResult.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));;
                    return;
                }
                searchResult.innerHTML = dompurify.sanitize(
                    `<div class="search__result">No results for ${this.value} found</div>`
                );
            })
            .catch(err => console.error(err));
    }

    searchInput.on('input', debounce(performSearch.bind(searchInput), 200));

    searchInput.on('keyup', (e) => {
        if (![38, 40, 13].includes(e.keyCode)) return;

        const activeClass = 'search__result--active';
        const current = search.querySelector(`.${activeClass}`);
        const items = search.querySelectorAll('.search__result');
        let next;

        if (e.keyCode === 40) {
            next = current ? current.nextElementSibling || items[0] : items[0]
        } else if (e.keyCode === 38) {
            next = current ? current.previousElementSibling || items[items.length - 1] : items[items.length - 1]
        } else if (e.keyCode === 13 && current.href) {
            return window.location = current.href;
        }

        if (current) {
            current.classList.remove(activeClass);
        }

        next.classList.add(activeClass);
        console.log(next)
    })
}

export default typeAhead;