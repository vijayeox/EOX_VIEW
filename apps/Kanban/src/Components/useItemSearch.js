import { useEffect, useState} from 'react';
import axios from 'axios';

export default function useItemSearch(query, pageNumber){

    useEffect(()=>{
        axios.get({
            method: 'GET',
            url:'https://qa3.eoxvantage.com:9080/app/454a1ec4-eeab-4dc2-8a3f-6a4255ffaee1/file',
            params: { q: query, page: pageNumber },
            
        })
        .then(res => console.log(res))
    })
}