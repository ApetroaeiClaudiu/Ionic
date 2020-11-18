import React from 'react';
import { IonCheckbox, IonIcon, IonItem, IonItemOptions, IonLabel } from '@ionic/react';
import {MovieProps} from './MovieProps';
import { trash } from 'ionicons/icons';

interface MoviePropsExt extends MovieProps {
  onEdit: (id?: string) => void;
  onDelete: (id?: string) => void;
}

const Movie: React.FC<MoviePropsExt> = ({ _id, director,title,year,treiD,price, onEdit,onDelete }) => {
  //console.log(treiD);
  return (
    <IonItem>
        <IonLabel onClick={() => onEdit(_id)}>{title} {director} {price} </IonLabel>
            <IonIcon icon={trash} onClick={() => onDelete(_id)}/>
            {/* <IonCheckbox checked={treiD}/> */}
    </IonItem>
  );
};

export default Movie;
