export const toggleLights = () => dispatch => {
	toggleEvent("http://localhost:5001/api/toggleLights");
};

export const togglePump = () => dispatch => {
	toggleEvent("http://localhost:5001/api/togglePump");
};

export const toggleAirPump = () => dispatch => {
	toggleEvent("http://localhost:5001/api/toggleAirPump");
};

export const toggleVent = () => dispatch => {
	toggleEvent("http://localhost:5001/api/toggleVent");
};

function toggleEvent(url) {
	return fetch(url)
		.then(function(response) {
			if (!response.ok) {
				throw Error(response.statusText);
			}
			return response.json();
		})
		.then(function(data) {
			console.log(data);
		})
		.catch(function(error) {
			console.log(error);
		});
}
