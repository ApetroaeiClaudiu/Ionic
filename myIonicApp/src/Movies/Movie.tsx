import React from 'react';
import { IonCheckbox, IonIcon, IonItem, IonItemOptions, IonLabel } from '@ionic/react';
import {MovieProps} from './MovieProps';
import { trash } from 'ionicons/icons';

interface MoviePropsExt extends MovieProps {
  onEdit: (id?: string) => void;
  onDelete: (id?: string) => void;
}

const Movie: React.FC<MoviePropsExt> = ({ _id, director,title,year,treiD,price,userId,version,webViewPath,lat,lng, onEdit,onDelete }) => {
  function onMaps(lat: number, lng: number) {
      const win = window.open(`https://www.google.ro/maps/@${lat},${lng},14z`, '_blank');
      win?.focus();
  }
  return (
    <IonItem>
        <IonLabel onClick={() => onEdit(_id)}>{title} {director} {price} </IonLabel>
        <IonLabel onClick={() => onMaps(lat, lng)}>{lat} {lng}</IonLabel>
        {webViewPath && (<img src={webViewPath} width={'100px'} height={'100px'}/>)}
        {!webViewPath && (<img src={'https://static.thenounproject.com/png/187803-200.png'} width={'100px'} height={'100px'}/>)}
        <IonIcon icon={trash} onClick={() => onDelete(_id)}/>
    </IonItem>
  );
};

export default Movie;
