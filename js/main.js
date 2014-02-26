var backContainers = new Array();
var container_list_item = '.interface-container ul li';
var initContainer = '.all-html-content';
var initOverview = '.overview-content';
var interfaceContainer = '.interface-container';
var old_fill_container = '';
var allParents = new Array();
var myListItem = '';
var breadcrumbParents = '';
var autoCompleteSources = [];

/* Initialize the DOM ready function */
jQuery(document).ready(function(){
	(function( $ ) {
		"use strict";

		/* Load the HTML from the map_files folder  */
		$("[data-xml]").each(function() {
			var src = $(this).attr("data-xml");
			var container = $(this);
		  	$.ajax({
			        type: "GET",
					url: src,
					dataType: "xml",
					success: function(xml) {
			 			initConstruct(xml, container);
			 			init();
					}
			});
		});

		function initConstruct(xml, container) {
			constructDOM($(xml).children().children().first(), container);
		}

		function constructDOM(element, container) {
			var children = element.children('node');
			
			if(children.length == 0) {
				return;
			}

			var ul = $('<ul>');
			
			$(container).append(ul);
			
			element.children('node').each( function() {
				var li = $('<li>');

				if($(this).children('font[BOLD="true"]').length > 0) {
					$('<span>').text($(this).attr('TEXT')).appendTo(li);
				}
				else {
					$(li).text($(this).attr('TEXT'));
				}

				if($(this).children('richcontent[TYPE="NOTE"]').length > 0) {
					var innerHTML = $(this).find('richcontent[TYPE="NOTE"] body').text();
					$(li).attr('data-description', innerHTML);
				}

				$(ul).append(li);
				constructDOM($(this), li);
			});

		}

		function init() {
			/* Add the Toggle and Select classes to the initContainer and add a main-ul class to the first ul */
			addClasses();
			/* Add parent and children classes to <li's> and <ul's> */
			addLevelClass($('.main-ul'), 1);
			/* Convert Toggles to real Toggles */
			initToggles();
			/* Convert Selects to real Selects */
			initSelects();
			/* Include span elements to Select items */
			includeSpans();
			/* Give data attributes to the elements */
			setDataAttributes();
			/* Load the documentation options, so users can find elements */
			initToolTips();
			/* When all the classes and the datahtml is added clone the initContainer in the interfaceContainer */
			$(initContainer).clone().fadeIn().appendTo(interfaceContainer);
			/* Grab the first ul, and not the rest of the HTML */
			var ulContainer = $(initContainer).find('ul').first().detach();
			/* Then clear the initContainer and append the ulContainer */
			$(initContainer).empty().append(ulContainer);
			/* After that, remove the "all-html-content" class */
			$(interfaceContainer).find('.all-html-content').removeClass('all-html-content');
			/* Load where we are right now and show manual */
			if($('.latest-documentation').length > 0) {
				initManual();
			}
		}

		function addLevelClass($parent, level) {
		    // add a parent class to the ul
		    $parent.addClass('parent-'+level);
		    // fetch all the li's that are direct children of the ul
		    var $children = $parent.children('li');
		    // add a child class to the li
		    $children.addClass('child-'+level);
		    // loop trough each li
		    $children.each(function() {
		        // get the ul that is a direct child of the li
		        var $sublist = $(this).children('ul');
		        // if an ul was found
		        if ($sublist.length > 0) {
		            // add a class to the current li indicating there is a sub list
		            $(this).addClass('has-children');
		            // repeat the process for the sublist, but with the level one higher
		            // = recursive function call
		            addLevelClass($sublist, level+1);
		        }
		    });
		    /* Add specific "selected" class when initialized */
		    $('ul.main-ul').children().first().addClass('selected');
		}

		function addClasses() {
			$(initContainer).children('ul').addClass('main-ul');

			/* Add classes for parent-1 menu break and toggles and selects */
			$(initContainer).find('ul li:contains("Notifications and configuration")').addClass('menu-break no-menu-item');
			$(initContainer).find('ul li:contains("(Toggle)")').addClass('menu-toggle-item');
			$(initContainer).find('ul li:contains("(Select)")').addClass('menu-select-item');
		}

		function includeSpans() {
			$('.interface-container ul:first > li').not(".interface-container ul li ul").each(function(){
				if(!$(this).hasClass('has-children')) {
					$(this).html($(this).html().replace('(', '<b>').replace(')', '</b>'));
					$(this).addClass('special-span');
				}
			});

			$('.interface-container ul:first > li').not(".interface-container ul li ul").each(function(){
				$(this).html($(this).html().replace('(Select)', '<p class="select-span"></p>'));
			});


		}

		function initScrollMore(ul) {
			/* Total amount of children */
			var childrenAmount = $(ul).children().length;
			/* Amount of times to scroll untill the end */
			var scrollToLast = childrenAmount - 6;
			
			if(childrenAmount >= 6) {
				$('.scroll-down-for-more').fadeIn(500);
			}
			// if ul has more then 6 children, then add something

			// if last child of ul is there, hide the view more
		}

		/* Go back to the previous container */
		$('.color-control-buttons').on('click', '.color-control-button-nav-left', function() {
			$(interfaceContainer).empty();
			$(old_fill_container).fadeIn().appendTo(interfaceContainer);
		});

		/* Go to the main menu */
		$('.color-control-buttons').on('click', '.color-control-button-right', function() {
			reloadEntireMenu();
		});

		/* Go to overview */
		$('.color-control-buttons').on('click', '.color-control-button-left', function() {
			goOverview();
		});

		/* Remove current tooltip */
		$(interfaceContainer).on('click', 'div.doc-tooltip .icon-close', function() {
			$(this).parent().fadeOut(500);
			allParents = new Array();
		});

		/* Key Functions */

		$(document).keydown(function(e) {
			/*
			// Enter
			if(e.which == 13) {
				reloadEntireMenu();
			}

			// Shift
			if(e.which == 16) {
				goOverview();
				e.preventDefault();
			}
			*/
			// Left arrow
			if(e.which == 37) {
				goBack();
				e.preventDefault();
			}
			
			// Up arrow
			if(e.which == 38) {
				goUp();
				e.preventDefault();
			}
			
			// Right arrow
			if(e.which == 39) {
				goRight();
				e.preventDefault();
			}
			
			// Down arrow
			if(e.which == 40) {
				goDown();
				e.preventDefault();
			}
			
			/* Space
			if(e.which == 32) {
				goRight();
				e.preventDefault();
			}
			*/
			/* Clear existing description */
			clearDocumentation();
			/* Check where we are right now and show the manual */
			if($('.latest-documentation').length > 0) {
				initManual();
			}

		});

		$('.color-control-buttons').on('click', '.color-control-button-nav-bottom', function() {
			goDown();
		});

		$('.color-control-buttons').on('click', '.color-control-button-nav-top', function() {
			goUp();
		});

		$('.color-control-buttons').on('click', '.color-control-button-nav-left', function() {
			goBack();
		});

		$('.color-control-buttons').on('click', '.color-control-button-nav-right', function() {
			goRight();
		});

		function goBack() {
			if(backContainers.length > 0) {
				$(interfaceContainer).empty();
				var allIds = backContainers.pop();
				var parentId = allIds.parent;
				var selectedId = allIds.selected;
				var cleanParent = $(initContainer).find('[data-id="' + parentId + '"]');
				$(cleanParent).clone().fadeIn().appendTo(interfaceContainer);
				clearSelected();
				var interfaceSelected = $(interfaceContainer).find('[data-id="' + selectedId + '"]');
				initSelectedSpecific(interfaceSelected);
				includeSpans();
				initSelects();
				emptyToolTips();
				tellTheUserWhatToDo();
			}
		}

		function goRight() {
			$('.interface-container ul:first > li.selected').not(".interface-container ul li ul li.selected").each(function(){
				if ($(this).hasClass( "has-children" ) ) {
					/* Get the id of the selected item */
					var parentId = $(this).parent().attr('data-id');
					var selectedId = $(this).attr('data-id');
					/* Push the id to the parent */
					backContainers.push({parent: parentId, selected: selectedId});

					var breadcrumb = $(this).find('span').first().text();
					$('.color-control-top-bar-title').text(breadcrumb);

					var ul = $(this).children('ul');
					old_fill_container = $('.interface-container').html();
					$(interfaceContainer).empty();
					$(ul).clone().fadeIn().appendTo(interfaceContainer);
					/* Convert Toggles to real Toggles */
					includeSpans();
					/* Convert Selects to real Selects */
					initSelects();
					initSelected();
					initScrollMore(ul);
					emptyToolTips();
					tellTheUserWhatToDo();
				}
			});
		}

		function goDown() {
			$('.interface-container ul:first > li.selected').not(".interface-container ul li ul li.selected").each(function(){
				var parent = $(this).parent();
				var scrollTo = $(this).next();

				if (!$( this ).is( ":last-child" ) ) {
					if(!$(this).next().hasClass('no-menu-item')) {
						$(this).next().addClass('selected');
						$(this).removeClass('selected');
						parent.scrollTo(scrollTo , 100, {margin:true} );
					}
					else {
						$(this).next().next().addClass('selected');
						$(this).removeClass('selected');
						parent.scrollTo(scrollTo , 100, {margin:true} );
					}
				}


			});
		}

		function goUp() {
			$('.interface-container ul:first > li.selected').not(".interface-container ul li ul li.selected").each(function(){
				var parent = $(this).parent();
				var scrollTo = $(this).prev();

				if (!$( this ).is( ":first-child" ) ) {
					if(!$(this).prev().hasClass('no-menu-item')) {
						$(this).prev().addClass('selected');
						$(this).removeClass('selected');
						parent.scrollTo(scrollTo , 100, {margin:true} );
					}
					else {
						$(this).prev().prev().addClass('selected');
						$(this).removeClass('selected');
						parent.scrollTo(scrollTo , 100, {margin:true} );
					}
				}
			});
		}

		function reloadEntireMenu() {
			/* Empty the container */
			$(interfaceContainer).empty();
			/* Clone the html-content into the container */
			$(initContainer).clone().fadeIn().appendTo(interfaceContainer);
			/* Set the top bar title to Products */
			$('.color-control-top-bar-title').text('Products');
		}

		function goOverview() {
			/* Empty the container */
			$(interfaceContainer).empty();
			/* Clone the html-content into the container */
			$(initOverview).clone().fadeIn().appendTo(interfaceContainer);
			/* Set the top bar title to Overview */
			$('.color-control-top-bar-title').text('Overview');
			/* Run navigateOverview */
			navigateOverview();
		}

		function initToggles() {
			$('.menu-toggle-item').each(function() {
				if(!$(this).hasClass('has-children')) {
					var itemToggle = $(this).find('span');
					$('.proto-toggle')
						.clone()
						.removeClass('proto-toggle')
						.appendTo(itemToggle);
					$('b').remove();
				}
			});
		}

		function initSelects() {
			$('.select-span').each(function() {
				var nextListItem = $(this).parent().next().children().eq(0).text();
				console.log($(this));
				$(this).text(nextListItem);
				$(this).parent().next().children().each(function() {
					$(this).addClass('select-option');
				});
			});
		}

		function initSelectedSpecific(element) {
			var firstListItem = $(element);
			firstListItem.addClass('selected');
			var firstUlItem = $(interfaceContainer).children().first();
			firstUlItem.addClass('main-ul');
		}

		function initSelected() {
			var firstListItem = $(interfaceContainer).children().first().children().first();
			firstListItem.addClass('selected');
			var firstUlItem = $(interfaceContainer).children().first();
			firstUlItem.addClass('main-ul');
		}

		function clearSelected() {
			var allSelectedItems = $(interfaceContainer).find('li.selected');
			$(allSelectedItems).removeClass('selected');
		}

/* Documentation Manual */
function initToolTips() {
	if($('.latest-documentation').length > 0) {
		var currentUl = $('.main-ul');
		
		/* Get all list items from the interface and fill them in the doc div */
		docGetListItems(currentUl);

		/* Set autocomplete width */
		setAutoCompleteWidth();
	}
}

function setAutoCompleteWidth() {
	var inputWidth = $('.documentation-search').width();
	$('.ui-autocomplete').css('width', inputWidth);
}

function string_to_slug(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();
  
  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to   = "aaaaeeeeiiiioooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
}

function setDataAttributes() {
	/* For each child, push it to autoCompleteSources */
	$(initContainer).find('li').each(function(i, ele) {
		var domel = $(this)[0];
		var text = domel.childNodes[0].textContent;
		var slug = string_to_slug(text);
		var numberslug = i + '-' + slug;
		domel.setAttribute("data-html", numberslug);
		var cutIndex = text.indexOf('(');
		if(cutIndex >= 0) {
			var cutText = text.substr(0, cutIndex);	
		}
		else {
			var cutText = text;
		}
		autoCompleteSources.push({'label': cutText, 'datahtml': numberslug});
	});
	/* Give all the children from the initContainer specific data-id's */
	$(initContainer).find('*').each(function(i, ele) {
		$(this).attr('data-id', i);
	});

}

function docGetListItems(currentUl) {
	/* Specify the documentation container */
	var docContainer = 'ul.documentation-list';
	
	/* Finally, initialize the autocomplete */
	$( ".documentation-search" ).autocomplete({
		source: autoCompleteSources,
		select: function(event, ui) {
			emptyToolTips();
			findToolTips(event, ui);
		}
    })
    .data( "ui-autocomplete" )
    	._renderItem = function( ul, item ) {
    		var breadcrumbs = [];
    		var breadcrumbs = getParents(item);

			var visible_breadcrumbs = '';
			for (var i = 0; i < breadcrumbs.length; i++) {
			    visible_breadcrumbs = breadcrumbs[i].label + " <span class='breadcrumb-arrow'>&raquo;</span> " + visible_breadcrumbs;
			}
  			return $( "<li>" )
   			.data( "ui-autocomplete-item", item )
    		.append( "<a data-html=" + item.datahtml + "><span class='autocomplete-label'>" + item.label + "</span><span class='autocomplete-breadcrumbs'>" + visible_breadcrumbs + "</span></a>" )
    		.appendTo( ul );
	};

}

function getParents(item) {
	var getParents = [];
	/* Set the Data HTML */
	var datahtml = item.datahtml;
	/* Set the Data Slug */
	var datalabel = item.label;
	/* Set the Data List Item */
	var myListItem = $(initContainer).find('li[data-html="' + datahtml + '"]');
	/* Get all the Parents */
	breadcrumbParents = myListItem.parentsUntil('.main-ul');

	breadcrumbParents.each(function(i, ele) {
		if($(this).is('li')) {
			var domel = $(this)[0];
			var text = domel.childNodes[0].textContent;
			getParents.push({'label': text});
		}
	});
	
	return getParents;

}

function emptyToolTips() {
	$('div.doc-tooltip').each(function() {
		$(this).fadeOut(500);
	});
}
function generateTopLevelToolTip(ListItem) {
	$('<div class="doc-tooltip"><span>Go here<i class="icon-close"></i></span></div>').hide().appendTo(ListItem).fadeIn(500);
}

function generateEndToolTip(ListItem) {
	$('<div class="doc-tooltip"><span>This is the item.<i class="icon-close"></i></span></div>').hide().appendTo(ListItem).fadeIn(500);
}

function generateBackToolTip() {
	$('<div class="back-tooltip"><span>Please return to the main menu<i class="icon-close"></i></span></div>').hide().appendTo('.interface-container').fadeIn(500);
}

function findToolTips(event, ui) {
	/* Set the Data HTML */
	var datahtml = ui.item.datahtml;
	/* Set the Data Slug */
	var datalabel = ui.item.label;
	/* Set the Data List Item */
	myListItem = $('li[data-html="' + datahtml + '"]');
	/* add Specific Class to myListItem */
	myListItem.addClass('last-breadcrumb-path-child');
	/* Get the parent of the List Item */
	var parent = myListItem.parent();
	/* Get all the parents */
	allParents = $.merge(myListItem, myListItem.parentsUntil('.main-ul'));
	/* Remove the focus from the search input field */
	$('.documentation-search').blur(); 
	/* Call a function to tell the users to go back if he's not in the right menu */
	tellTheUserWhatToDo(myListItem);
}

function tellTheUserWhatToDo() {

	if(allParents.length == 0) {
		// Nothing happens
	}
	
	else {

		/* Check in the allParents if the user is currently in a specific item in the path */
		allParents.each(function() {
			$(this).addClass('breadcrumb-path-child');
		});
		/* Get the current list item which is selected */
		var selectedListItem = $(interfaceContainer).find('li.selected');

		var parentListItem = selectedListItem.parent();
		var addedToolTip = false;

		$(parentListItem).each(function() {
			if($(this).children().hasClass('breadcrumb-path-child')) {
				var breadcrumbChild = $(this).children('li.breadcrumb-path-child');

				if(breadcrumbChild.hasClass('last-breadcrumb-path-child')) {
					generateEndToolTip(breadcrumbChild);
					allParents = new Array();
				}

				else {
					generateTopLevelToolTip(breadcrumbChild);
				}
				
				/* Set added ToolTip to true */
				addedToolTip = true;
			}
		});

		/* If no ToolTip is added */
		if(addedToolTip == false) {
			generateBackToolTip();
		}
	}
}

function initManual() {
	var selected = $(interfaceContainer).find('li.selected');
	var itemDescription = $(selected).attr('data-description');
	var javascriptElement = $(selected)[0];
	var trimmedTitle = $.trim(javascriptElement.childNodes[0].textContent);
	/* Append Item Description to doc container */
	var trimmedItemDesc = $.trim(itemDescription);
	$('.doc-description-text').text(trimmedItemDesc);
	$('.doc-description-title').text(trimmedTitle);
}

function clearDocumentation () {
	$('.doc-description-text').empty();
	$('.doc-description-title').empty();
}

function navigateOverview() {
	
	$('div.overview-content').on('click', 'button.overview-next', function() {
		$('.current').removeClass('current').hide()
	        .next().show().addClass('current');
	    if ($('.current').hasClass('last')) {
	        $('button.overview-next').attr('disabled', true);
	    }
	    $('button.overview-previous').attr('disabled', null); 
	});

	$('div.overview-content').on('click', 'button.overview-previous', function() {
	    $('.current').removeClass('current').hide()
	        .prev().show().addClass('current');
	    if ($('.current').hasClass('first')) {
	        $('button.overview-previous').attr('disabled', true);
	    }
	    $('button.overview-next').attr('disabled', null);
	}); 

}
	})( jQuery, window, document );
});