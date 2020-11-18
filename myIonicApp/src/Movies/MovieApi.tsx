import axios from 'axios';
import {authConfig, getLogger} from '../core';
import { MovieProps } from './MovieProps';
import {Plugins} from "@capacitor/core";

const {Storage} = Plugins;

const log = getLogger('movieApi');

const baseUrl = 'localhost:3000';
const movieUrl = `http://${baseUrl}/api/movie`;

interface ResponseProps<T> {
  data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
  //log(`${fnName} - started`);
  return promise
    .then(res => {
      //log(`${fnName} - succeeded`);
      return Promise.resolve(res.data);
    })
    .catch(err => {
      //log(`${fnName} - failed`);
      return Promise.reject(err);
    });
}

const config = {
  headers: {
    'Content-Type': 'application/json'
  }
};

export const getMovies: (token: string, offset: number, size: number, isGood: boolean | undefined, searchName: string) => Promise<MovieProps[]> = (token, offset, size, isGood, searchName) => {
  const result = axios.get(movieUrl + `?offset=${offset}&size=${size}&isGood=${isGood}&nameFilter=${searchName}`, authConfig(token));
  result.then(function (result) {
    //console.log("Entering movieApi - getMovies - No Network Will Throw HERE!");
    result.data.forEach(async (item: MovieProps) => {
      await Storage.set({
        key: String(item._id!),
        value: JSON.stringify(item),
      });
    });
  })

  return withLogs(result, 'getItems');
}

export const createMovie: (token: string, item: MovieProps) => Promise<MovieProps[]> = (token, item) => {
  const result = axios.post(movieUrl, item, authConfig(token));
  result.then(async function (result) {
    await Storage.set({
      key: result.data._id!,
      value: JSON.stringify(result.data),
    });
  });
  return withLogs(result, 'createMovie');
}

export const updateMovie: (token: string, item: MovieProps) => Promise<MovieProps[]> = (token, item) => {
  const result = axios.put(`${movieUrl}/${item._id}`, item, authConfig(token));
  result.then(async function (result) {
    await Storage.set({
      key: result.data.id!,
      value: JSON.stringify(result.data),
    });
  });
  return withLogs(result, 'updateItem');
}

export const deleteMovie: (token: string, itemID: string) => Promise<MovieProps[]> = (token, itemID) => {
  const result = axios.delete(`${movieUrl}/${itemID}`, authConfig(token));
  result.then(async function () {
    await Storage.remove({key: String(itemID!)});
  });
  return withLogs(result, 'deleteMovie');
}

interface MessageData {
  type: string;
  payload: MovieProps;
}

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${baseUrl}`)
  ws.onopen = () => {
    //log('web socket onopen');
    ws.send(JSON.stringify({type: 'authorization', payload: {token}}));
  };
  ws.onclose = () => {
    //log('web socket onclose');
  };
  ws.onerror = error => {
    //log('web socket onerror', error);
  };
  ws.onmessage = messageEvent => {
    //log('web socket onmessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}