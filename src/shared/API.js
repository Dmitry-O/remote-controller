export function postController(url, body) {
    return fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => {
            if (res.ok) return res;
            else {
                let error = new Error('Error ' + res.status);
                error.res = res;
                throw error;
            }
        }, error => { throw error })
        .then(res => res.json())
        .catch(err => err.res);
}

function getController(url, body) {
    return fetch(url, {
        method: "GET",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => {
            if (res.ok) return res;
            else {
                let error = new Error('Error ' + res.status);
                error.res = res;
                throw error;
            }
        }, error => { throw error })
        .then(res => res.json())
        .catch(err => console.log(err.res));
}

export function putController(url, body) {
    return fetch(url, {
        method: "PUT",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(res => {
            if (res.ok) return res;
            else {
                let error = new Error('Error ' + res.status);
                error.res = res;
                throw error;
            }
        }, error => { throw error })
        .then(res => res.json())
        .catch(err => err.res);
}