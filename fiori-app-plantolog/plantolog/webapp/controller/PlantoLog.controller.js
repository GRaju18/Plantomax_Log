sap.ui.define([
	//"sap/ui/core/mvc/Controller"
	"com/9b/PlantoLog/controller/BaseController",
	"com/9b/PlantoLog/model/models",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/core/Fragment"
], function (BaseController, model, DateFormat, Sorter, Filter, FilterOperator, FilterType, Fragment) {
	"use strict";

	return BaseController.extend("com.9b.PlantoLog.controller.MetricLog", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.9b.PlantoLog.view.TrackingIds
		 */
		formatter: model,
		onInit: function () {
			this.getOwnerComponent().getRouter(this).attachRoutePatternMatched(this._objectMatched, this);
		},
		_objectMatched: function (oEvent) {
			if (oEvent.getParameter("name") === "PlantoLog") {
				this.byId("Log").setSelectedKey("PT");
				this.loadMasterData();
			} else {
				return;
			}
		},
		refreshLogtable: function () {
			this.loadMasterData();
		},
		loadMasterData: function () {
			var jsonModel = this.getOwnerComponent().getModel("jsonModel");
			var that = this;
			var selTab = this.byId("Log").getSelectedKey();
			var filters;
			if (selTab == "PT") {
				filters = "?$filter=U_NAPP eq 'Pheno Track' ";
			} else if (selTab == "MP") {
				filters = "?$filter=U_NAPP eq 'MicroPropagation' ";
			} else if (selTab == "MAP") {
				filters = "?$filter=U_NAPP eq 'MacroPropagation' ";
			} else if (selTab == "MP") {
				filters = "?$filter=U_NAPP eq 'Mother' ";
			} else if (selTab == "CP") {
				filters = "?$filter=U_NAPP eq 'Cultivation' ";
			}
			var orderBy = "&$orderby=CreateDate desc,CreateTime desc";
			this.readServiecLayer("/b1s/v2/NBNLG" + filters + orderBy, function (data) {
				//code for display updated date time
				var cDate = new Date();
				var dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "KK:mm:ss a"
				});
				var refreshText = dateFormat.format(cDate);
				jsonModel.setProperty("/refreshText", "Last Updated " + refreshText);
				jsonModel.setProperty("/refreshState", "Success");
				jsonModel.setProperty("/cloneTableData", data.value);
				//this.byId("tableHeader1").setText("Plants (" + data.value.length + ")");
			}, this.getView());
		},
		onTabChange: function (evt) {
			this.loadData();
		},

		onSyncBack: function (evt) {
			var that = this;
			var sObj = evt.getSource().getBindingContext("jsonModel").getObject();
			var payLoad = sObj.U_NLGBD;
			if (payLoad) {
				var metrcUrl = sObj.U_NLURL;
				payLoad = JSON.parse(payLoad);
				this.callMetricsService(metrcUrl, "POST", payLoad, function () {
					that.loadStrainData();
				}, function (error) {
					sap.m.MessageToast.show(JSON.stringify(error));
				});
			}
		},
		onCellPress: function (evt) {
			var jsonModel = this.getOwnerComponent().getModel("jsonModel");
			if (!this.textDialog) {
				this.textDialog = sap.ui.xmlfragment("textDialog", "com.9b.PlantoLog.view.fragments.TextDialog", this);
				this.getView().addDependent(this.textDialog);
			}
			var text = evt.getSource().getText();
			jsonModel.setProperty("/temNOTES", text);
			this.textDialog.open();
		},
		onClose: function () {
			this.textDialog.close();
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.9b.PlantoLog.view.TrackingIds
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.9b.PlantoLog.view.TrackingIds
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.9b.PlantoLog.view.TrackingIds
		 */
		//	onExit: function() {
		//
		//	}

	});

});