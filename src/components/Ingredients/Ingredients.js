import React, { useReducer, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';

const ingredientReducer = (currentIngredients, action) => {
  switch(action.type){
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];      
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id);
    default:
      throw new Error('Should not get there!');
  }
}

const httpReducer = (currentHttpState, action) => {
  switch(action.type) {
    case 'SEND':
      return {loading: true, error: null};
    case 'RESPONSE':
      return {...currentHttpState,loading: false};
    case 'ERROR':
      return {loading: false, error: action.errorMessage};
    case 'CLEAR':
      return {...currentHttpState,error: null};
    default:
      throw new Error('Should not be reached!');
  }
}

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {loading: false, error: null})
  // const [userIngredients, setUserIngredients ] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState();

  // useEffect(() => {
  //   fetch('https://react-hooks-83319.firebaseio.com/ingredients.json').then(
  //     res => res.json()
  //   ).then(responseData => {
  //     const loadedIngredients = [];
  //     for(const key in responseData){
  //       loadedIngredients.push({
  //         id: key,
  //         title: responseData[key].title,
  //         amount: responseData[key].amount
  //       })
  //     }
  //     setUserIngredients(loadedIngredients);
  //   })    
  // },[]);

  useEffect(() => {
    console.log('RENDERING INGREDIENTS', userIngredients);
  }, [userIngredients])

  const filteredIngredientHandler = useCallback(filteredIngredients => {
    dispatch({type: 'SET', ingredients: filteredIngredients});
  },[]);

  const addIngredientHandler = useCallback(ingredient =>{
    dispatchHttp({type: 'SEND'});    
    fetch('https://react-hooks-83319.firebaseio.com/ingredients.json',{
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type' : 'application/json' }
    }).then( res => {
      dispatchHttp({type: 'RESPONSE'});
      return res.json();      
    }).then( responseData => {   
      dispatch({type: 'ADD', ingredient:  { 
        id: responseData.name, 
        ...ingredient
      }});         
    }).catch( err => {
      dispatchHttp({type: 'ERROR', errorMessage: 'Something went wrong!'});
    });
    
  }, []);

  const removeIngredientHandler = useCallback(id =>{
    dispatchHttp({type: 'SEND'});
    fetch(`https://react-hooks-83319.firebaseio.com/ingredients/${id}.json`,{
      method: 'DELETE'      
    }).then(res => {
      dispatchHttp({type: 'RESPONSE'});
      dispatch({type: 'DELETE', id: id});       
    }).catch( err => {
      dispatchHttp({type: 'ERROR', errorMessage: 'Something went wrong!'});
    });    
  },[]);

  const clearError = useCallback(() => {
    dispatchHttp({type: 'CLEAR'});
  }, []);
  
  const ingredientList = useMemo(() => {
    return (
      <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler}/>
    )
  },[userIngredients, removeIngredientHandler]);

  // console.log(userIngredients);
  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}
      <IngredientForm onAddIngredient={addIngredientHandler} loading={httpState.loading}/>
      <section>
        <Search onLoadIngredients={filteredIngredientHandler}/>
        {/* Need to add list here! */}
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
