sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("com.9b.PlantoLog.controller.App", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 */
		onInit: function () {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			this.animatePlantCount();
			//	this.getOwnerComponent().getModel().setSizeLimit(100000);

		},

		/**
		 * Called when load the count in animated format in header for for all screens.
		 */
		animatePlantCount: function () {
			$(".plantCountText").each(function () {
				$(this).prop("Counter", 0).animate({
					Counter: $(this).text()
				}, {
					duration: 2000,
					easing: "swing",
					step: function (now) {
						$(this).text(Math.ceil(now));
					}
				});
			});
		}
	});
});