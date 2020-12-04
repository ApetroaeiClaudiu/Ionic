import { IonButton, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonLoading, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import React from "react";
import { useContext, useEffect, useReducer, useState } from "react";
import { RouteComponentProps } from "react-router";
import Movie from "./Movie";
import { MovieProps } from "./MovieProps";
import { MovieContext } from "./MovieProvider";
export{}

const MoviesConflict :React.FC<RouteComponentProps> = ({history}) => {
    const {conflictMovies} = useContext(MovieContext);
    const {saving,savingError,saveMovie} = useContext(MovieContext);
    const [firstMovie,setFirstMovie] = useState<MovieProps>();
    const [secondMovie,setSecondMovie] = useState<MovieProps>();
    useEffect(setMovies,[]);

    function setMovies(){
        console.log("da");
        console.log(conflictMovies?.length)
        if(!conflictMovies || conflictMovies?.length === 0 ){
            history.goBack();
            return;
        }
        setFirstMovie(conflictMovies[0]);
        setSecondMovie(conflictMovies[1]);
    }

    const handleSave = (movie:MovieProps)=>{
        saveMovie && saveMovie(movie).then(()=>{
            conflictMovies?.shift();
            conflictMovies?.shift();
            setMovies();
        });
    };

    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Version Conflicts</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                {firstMovie && (<Conflict movie={firstMovie} onAction={handleSave}/>)}
                <div>Versus</div>
                {secondMovie && (<Conflict movie={secondMovie} onAction={handleSave}/>)}
                {/* <IonLoading isOpen={saving}/>
                {savingError && (<div>{savingError.message || 'Failed to save'}</div>)} */}
            </IonContent>
        </IonPage>
    );
};

export default MoviesConflict;

export const Conflict: React.FC<{ movie:MovieProps, onAction: (movie:MovieProps) => void }> =
({movie, onAction}) => {
    return (
      <IonItem>
          <IonLabel>{movie.title} {movie.director} {movie.price} </IonLabel>
          <IonButton onClick={() => onAction(movie)}>
              Accept this version
          </IonButton>
      </IonItem>
    );
  };