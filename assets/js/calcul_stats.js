var jsonuploaded;
var json_with_category;

$(document).ready(function() {
	jsonuploaded = false;
	var secondeperframe = 0.0;//

	//************To upload Json****************
	//stores the output of a parsed JSON file
	const parsed = jsonText => JSON.parse(jsonText);
	//creates a new file reader object
	const fr = new FileReader();

	function writeInfo (data) {
		json = data
	};

	function handleFileSelect (evt) {
	//function is called when input file is Selected
	//calls FileReader object with file
	fr.readAsText(evt.target.files[0])
};

fr.onload = e => {
	//fuction runs when file is fully loaded
	//parses file then makes a call to writeInfo to display info on page
	jsonuploaded  =true;
	writeInfo(parsed(e.target.result));
};

	//event listener for file input
	document.getElementById('imported').addEventListener('change', handleFileSelect, false);
});

//add listeners
document.getElementById("calcul").addEventListener("click", RefreshDisplay);
document.getElementById("download").addEventListener("click", DownloadNewJson);
document.getElementById("downloadCC").addEventListener("click", DownloadStatFile);

//***************To download new Json with category id*****************
function DownloadNewJson(){
	if(jsonuploaded){
		get_number_of_actions(json); //permit to put id on the category
		var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json_with_category));
		var downloadAnchorNode = document.createElement('a');
		downloadAnchorNode.setAttribute("href",dataStr);
		downloadAnchorNode.setAttribute("download", "annotations_with_categories_id.json");
	    document.body.appendChild(downloadAnchorNode); // required for firefox
	    downloadAnchorNode.click();
	    downloadAnchorNode.remove();
	}
	else{
		alert('You need to upload a json file to download a new one');
	}
}

//****************To download the json stats**************************
function DownloadStatFile(){
	if(jsonuploaded){
		var stats_Json = get_number_of_actions(json);
		stats_Json = stats_Json.statsJson;
		stats_Json.folder_name = document.getElementById("foldername").value;
		var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats_Json));
		var downloadAnchorNode = document.createElement('a');
		downloadAnchorNode.setAttribute("href",dataStr);
		downloadAnchorNode.setAttribute("download", stats_Json.folder_name + "_stats.json");
	    document.body.appendChild(downloadAnchorNode); // required for firefox
	    downloadAnchorNode.click();
	    downloadAnchorNode.remove();
	}
	else{
		alert('You need to upload a json file to download the stats');
	}

}

function Get_total_time(json,category){
	var count = 0;
	for (var frame in json){
		for (var annotation in json[frame].annotations){
			if (json[frame].annotations[annotation].category == category){
				count++;
			}
		}
	}
	return (count*secondeperframe);
}

function getElementsGeneral(HTMLId,JavascriptId){
	document.getElementById(HTMLId).innerHTML = JavascriptId;
}

function RefreshDisplay(){
	try{
		secondeperframe = document.getElementById("time").value / Object.keys(json).length;

		var numbers_of_actions = get_number_of_actions(json);

		getElementsGeneral("nb-ord",numbers_of_actions.ordering);
		getElementsGeneral("nb-pik",numbers_of_actions.picking_up);
		getElementsGeneral("nb-rec",numbers_of_actions.receiving);
		getElementsGeneral("nb-pay",numbers_of_actions.paying);
	//refresh numbers of clients
	getElementsGeneral("nb_co",numbers_of_actions.number_customer);
	//get nu,ber of customers
	var nb_co = numbers_of_actions.number_customer;
	//get total time of a category
	var nb_ord_hour = Math.round(Get_total_time(json,"ordering"));
	var nb_pik_hour = Math.round(Get_total_time(json,"picking_up"));
	var nb_rec_hour = Math.round(Get_total_time(json,"receiving"));
	var nb_pay_hour = Math.round(Get_total_time(json,"paying"));
	//get time of category by person
	var nb_ord_cust = Math.round(Get_total_time(json,"ordering")/nb_co);
	var nb_pik_cust = Math.round(Get_total_time(json,"picking_up")/nb_co);
	var nb_rec_cust = Math.round(Get_total_time(json,"receiving")/nb_co);
	var nb_pay_cust = Math.round(Get_total_time(json,"paying")/nb_co);

	//refresh total times
	getElementsGeneral("nb_ord_hour",format_hh_mm_ss(nb_ord_hour));
	getElementsGeneral("nb_rec_hour",format_hh_mm_ss(nb_rec_hour));
	getElementsGeneral("nb_pay_hour",format_hh_mm_ss(nb_pay_hour));
	getElementsGeneral("nb_pik_hour",format_hh_mm_ss(nb_pik_hour));

	//refresh time by customers

	getElementsGeneral("nb_ord_cust",format_hh_mm_ss(nb_ord_cust));
	getElementsGeneral("nb_pik_cust",format_hh_mm_ss(nb_pik_cust));
	getElementsGeneral("nb_rec_cust",format_hh_mm_ss(nb_rec_cust));
	getElementsGeneral("nb_pay_cust",format_hh_mm_ss(nb_pay_cust));

	document.getElementById("result").style.display = "block";


}
catch{
	alert('You need to upload a json file and fill the video duration to start the calcul !');
}
}


function format_hh_mm_ss(time){

	var h = Math.round(time/3600);
	var m = Math.round((time%3600)/60);
	var s = Math.round((time%3600)%60);
	var formattime = "";
	if (h > 0){
		formattime += h + "h ";
	}
	if (m > 0){
		formattime += m + "min ";
	}

	formattime += s + "sec ";

	return formattime;
}

function get_category_code(category){
	if(category == "ordering"){
		category_code = 1;
	}
	else if(category == "paying"){
		category_code = 2;
	}
	else if(category == "receiving"){
		category_code = 3;
	}
	else if(category == "picking_up"){
		category_code = 4;
	}
	return category_code;
}

function get_number_of_actions(json){

	json_with_category = json;

	var nb_ord = 0;
	var nb_rec = 0;
	var nb_pay = 0;
	var nb_pik = 0;

	var people = [];
	var num_of_frame = 0;
	var old_num_of_frame = 0;
	var json_recap = {};
	json_recap.category = [];
	var number_customer = 0;

	for (var frame in json){
		num_of_frame++;
		//Here we put the category to the old category array.
		for (i in people){
				people[i].categoryinOldFrame = people[i].categoryincurrentFrame;
				people[i].categoryincurrentFrame = [];
		}
		for (var annotation in json[frame].annotations){ //FOR each annotation in each frames
			RemoveCategoryinstanceId(frame,annotation);
			var current_category  = json[frame].annotations[annotation].category.toString().trim(); //this is the current action
			var personid = json[frame].annotations[annotation].id //this is the current id
			if (!check_if_person_is_in_array(personid,people)){ //if a new ID appear. we put it on the list.
				var current_user = new person(personid)
				people.push(current_user);
			}
			var user = getPersonInArray(people,personid) //get the user we are instrested
			if (current_category == "undefined" | current_category == "" | current_category == "0" | current_category =="1"){ // If the user doesn't do anything
				Change_category_to_nothing(frame,annotation); //write the category properly with ""
				put_category_id_for_current_annotation(frame,annotation,null);//set the field category id to null
			}
			else{ //the user doing any action
				user.categoryincurrentFrame.push(current_category);
				switch(current_category){ //id the user do something
					case "paying":
					if (!check_if_action_is_in_array(current_category,user.actions)){ //if he's not currently doing the action
						nb_pay++;//we count a new one							
						user.addAction(new Action(nb_pay,current_category,num_of_frame));//we add it on the list of action he doing
					}
					put_category_id_for_current_annotation(frame,annotation,nb_pay); //finaly, we put the correct category number
					break;
					case "receiving":
					if (!check_if_action_is_in_array(current_category,user.actions)){
						nb_rec++;
						user.addAction(new Action(nb_rec,current_category,num_of_frame));
					}
					put_category_id_for_current_annotation(frame,annotation,nb_rec)
					break;
					case "picking_up":
					if (!check_if_action_is_in_array(current_category,user.actions)){
						nb_pik++;
						user.addAction(new Action(nb_pik,current_category,num_of_frame));
					}
					put_category_id_for_current_annotation(frame,annotation,nb_pik);
					break;
					case "ordering":
					if (!check_if_action_is_in_array(current_category,user.actions)){
						nb_ord++;
						user.addAction(new Action(nb_ord,current_category,num_of_frame));
					}
					put_category_id_for_current_annotation(frame,annotation,nb_ord);
					break;
				}
			}
		}
		//when all the annotations are read. We compare the two array of category to know with categorie has stopped.
		people.forEach(function(person) {
			if (person.actions.length > 0){ //check if person doing something. it permit to rediuce calculs
				for (i in person.categoryinOldFrame){
					if (!person.categoryincurrentFrame.includes(person.categoryinOldFrame[i])){ //if a person stop doing a category we stop the action and write it on the json
						var action = getActionsInArray(person.categoryinOldFrame[i],person.actions);
						action.finish(num_of_frame-1);
						json_recap.category.push(action);
						person.removeAction(person.categoryinOldFrame[i]);
					}
				}
			}
		});
	}

	for (var i in people){
		var thePers = people[i];
		if(thePers.isClient == true){
			number_customer++;
		}
	}
	json_recap.number_customer = number_customer;
	json_recap.total_frames_in_the_video = num_of_frame;
	return {
		ordering: nb_ord,
		paying: nb_pay,
		receiving: nb_rec,
		picking_up: nb_pik,
		number_customer: number_customer,
		statsJson: json_recap
	};
}



//clarify JSON
function put_category_id_for_current_annotation(frame,annotation,number){
	json_with_category[frame].annotations[annotation].category_instance_id = number;
}
function Change_category_to_nothing(frame,annotation){
	json_with_category[frame].annotations[annotation].category = "";
}
function RemoveCategoryinstanceId(frame,annotation){
	try{
		delete json_with_category[frame].annotations[annotation]['action instance id'];
	}
	catch{
		l("error")
	}
}




//SORT METHOD FOR ARRAY
function check_if_person_is_in_array(id,array){
	var isIn = false;
	array.forEach(function(i) {
		if (i.id == id){
			isIn = true;
		}
	}
	)
	return isIn
}
function check_if_action_is_in_array(category,array){
	var isIn = false;
	array.forEach(function(i) {
		if (i.category == category){
			isIn = true;
		}
	}
	)
	return isIn
}
function getPersonInArray(array,id){
	var per = new person();
	array.forEach(function(i) {
		if (i.id == id){
			per = i
		}
	}
	)
	return per
}

function getActionsInArray(category,array){
	var act;
	array.forEach(function(i) {
		if (i.category == category){
			act = i
		}
	}
	)
	return act
}



//----------------------------------------Classes------------------------------------
class person{
	constructor(id = -1){
		this.id = id; //id of the person
		this.actions = [] //the list of actions he's doing (what is the category and on witch frame it begin and finish)
		this.categoryinOldFrame = []; //permit to compare from a frame to the next one, what action is going on.
		this.categoryincurrentFrame = [];
		this.isClient = false;
	}
	addAction(action){
		this.actions.push(action);
		this.isClient = true;
	}
	removeAction(action){
		for( var i = 0; i < this.actions.length; i++){ 
			if ( this.actions[i].category == action) {
				this.actions.splice(i, 1); 
				i--;
			}
		}
	}
	isDoingTheAction(action){
		var isdoing = false;
		for( var i in this.actions){ 
			if ( this.actions[i].category == action) {
				isdoing = true;
			}
		}
		return isdoing;
	}
}

class Action{
	constructor(id,category,start_frame){
		this.id = id;
		this.category = category;
		this.category_code=get_category_code(category);
		this.start_frame=start_frame;
	}
	finish(end_frame){
		this.end_frame = end_frame;
		this.total_num_of_frames = this.end_frame-this.start_frame;
	}
}


function l(oui){
	console.log(oui);
}