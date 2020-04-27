import { useReducer, useCallback } from 'react';

const initialState = 
{
    loading: false, 
    error: null,
    data: null,
    extra: null,
    identifier: null
};

const httpReducer = (currentHttpState, action) => {
    switch(action.type) {
      case 'SEND':
        return {loading: true, error: null, extra: null, identifier: action.reqIdentifer};
      case 'RESPONSE':
        return {...currentHttpState,loading: false, data: action.responseData, extra: action.reqExtra };
      case 'ERROR':
        return {loading: false, error: action.errorMessage};
      case 'CLEAR':
        return initialState;
      default:
        throw new Error('Should not be reached!');
    }
}

const useHttp = () => {
    const [httpState, dispatchHttp] = useReducer(httpReducer, 
        {
            loading: false, 
            error: null,
            data: null,
            extra: null,
            identifier: null
        });
    
    const clear = useCallback(() => dispatchHttp({type: 'CLEAR'}), []);

    const sendRequest = useCallback((url, method, body, reqExtra, reqIdentifer) => {
        dispatchHttp({type: 'SEND', reqIdentifer: reqIdentifer});
        fetch(
            url,
            {
                method: method,
                body: body,
                headers: {
                    'Content-Type' : 'application/json'
                }
            })
        .then(res => {
            return res.json()            
        })
        .then(responseData => {
            dispatchHttp({type: 'RESPONSE', responseData: responseData, reqExtra: reqExtra});     
        })
        .catch( err => {
            dispatchHttp({type: 'ERROR', errorMessage: 'Something went wrong!'});
        }); 
    },[])
    
    return {
        isLoading: httpState.loading,
        data: httpState.data,
        error: httpState.error,
        sendRequest: sendRequest,
        reqExtra: httpState.extra,
        reqIdentifer: httpState.identifier,
        clear: clear
    };
};

export default useHttp;