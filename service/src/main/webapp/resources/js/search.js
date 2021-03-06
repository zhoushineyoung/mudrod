var g_currentQuery, g_currentSearchOption;

$(document).ready(function() {
	var query = getURLParameter('query');
	g_currentSearchOption = getURLParameter('searchOption');
	if(g_currentSearchOption) {
		$('#searchOption_' + g_currentSearchOption).prop('checked', true);
	}
	if (query == null) {
		$("#searchResults").hide();
	} else {
		g_currentQuery = encodeURI(query);
		$("#searchResults").hide();
		$("#NotFound").hide();
		$("#query").val(query);
		search(query);
	}

	$("#query").keyup(function(event) {
		if (event.keyCode == 13) {
			$("#searchButton").click();
		}
	});

	$("#searchButton").click(function() {
		redirect("search", "query", $("#query").val(), "searchOption", $("input[name='searchOption']:checked").val());
	});

	$("#ontologyUL").on("click", "li a", function(){
		redirect("search", "query", $(this).data("word"), "searchOption", $("input[name='searchOption']:checked").val());
	});
});

function search(query) {
	if ($("#query").val() != "") {
		$("#searchBox").append($("#searchGroup"));
		$("#searchjumbo").hide();
		$("#note").hide();
		$("#searchResults").show();
		$("#searchLoading").show();

		$("#searchContainer").css("margin-top", "30px");
		$("#searchResultContainer").show();
		$("#searchContainer h2.title").css("font-size", "24px");
		var search_operator = $("input[name='searchOption']:checked").val();
		$.ajax({
			url : "SearchMetadata",
			data : {
				"query" : $("#query").val(),
				"operator": $("input[name='searchOption']:checked").val()
			},
			success : function completeHandler(response) {
				if (response != null) {
					$("#searchLoading").hide();

					var searchResults = response.PDResults;
					if (searchResults.length == 0) {
						$("#NotFound").show();
						$("#searchKeyword").html($("#query").val());
						$("#resultCount, #ontology-results").hide();
					} else {
						$("#NotFound").hide();
						$("#resultCount, #ontology-results").show();
						$("#resultCount").html(searchResults.length + ' matches');
						createResultTable();
						$('#ResultsTable').bootstrapTable('load', searchResults);
					}
				}
			}
		});

		$.ajax({
            url: "SearchVocab",
            data: {
                "concept": $("#query").val().toLowerCase(),
				"operator": $("input[name='searchOption']:checked").val()
            },
            success: function completeHandler(response) {
                if (response != null) {
                    var ontologyResults = response.graph.ontology;
                    if(ontologyResults.length == 0) {
                    	
                    } else {
						//$("#ontologyResultCount").html(searchResults.length + ' Matching Collections');
                    	for(var i = 0; i < ontologyResults.length; i++){
                    		$("#ontologyUL").append("<li><a data-word='" + ontologyResults[i].word  + "' href='#'>" + ontologyResults[i].word + " (" + ontologyResults[i].weight + ")</a></li>");
                    	}                    	
                    }
                }
            }
        });
	}
}

function FileNameFormatter(value) {
	var url = "http://podaac.jpl.nasa.gov/ws/metadata/dataset?format=gcmd&shortName="
			+ encodeURIComponent(value);
	// url = encodeURIComponent(url);
	url = "./dataset.html?query=" + g_currentQuery + "&searchOption=" + g_currentSearchOption + "&shortname=" + value;
	return '<a class="fileShortName" href=' + url + ' target="_blank">' + value + '</a>';
}

function createResultTable() {
	var layout = {
		cache : false,
		pagination : true,
		pageSize : 10,
		striped : true,
		// pageList : [ 10, 25, 50, 100, 200 ],
		// sortName : "Time",
		// sortOrder : "asc",
		cardView : true,
		showHeader : true,

		columns : [ {
			'title' : 'Short Name',
			'field' : 'Short Name',
			'formatter' : FileNameFormatter,
			sortable : true
		}, {
			'title' : 'Long Name',
			'field' : 'Long Name',
		}, {
			'title' : 'Topic',
			'field' : 'Topic',
			'formatter' : TopicFormatter,
		}, {
			'title' : 'Release Date',
			'field' : 'Release Date',
		}, {
			'title' : 'Abstract',
			'field' : 'Abstract',
		} ]

	};

	$('#ResultsTable').bootstrapTable(layout);
}