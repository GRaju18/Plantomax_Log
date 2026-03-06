/*global history */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/Filter"
], function (Controller, UIComponent, History, MessageBox, Filter) {
	"use strict";
	return Controller.extend("com.9b.PhenoTrack.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},
		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},
		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		createFilter: function (key, operator, value, useToLower) {
			return new Filter(useToLower ? "tolower(" + key + ")" : key, operator, useToLower ? "'" + value.toLowerCase() + "'" : value);
		},

		cellClick: function (evt) {
			//	evt.getParameter("cellControl").getParent()._setSelected(true);
			var cellControl = evt.getParameter("cellControl");
			var isBinded = cellControl.getBindingContext("jsonModel");
			if (isBinded) {
				var oTable = evt.getParameter("cellControl").getParent().getParent();
				var sIndex = cellControl.getParent().getIndex();
				var sIndices = oTable.getSelectedIndices();
				if (sIndices.includes(sIndex)) {
					sIndices.splice(sIndices.indexOf(sIndex), 1);
				} else {
					sIndices.push(sIndex);
				}
				if (sIndices.length > 0) {
					jQuery.unique(sIndices);
					$.each(sIndices, function (i, e) {
						oTable.addSelectionInterval(e, e);
					});
				} else {
					oTable.clearSelection();
				}
			}
		},
		getAppConfigData: function () {
			var jsonModel = this.getOwnerComponent().getModel("jsonModel");
			var filters = "?$filter=U_NAPP eq 'AllApps'  or U_NAPP eq 'PHENOTRACK'  ";
			this.readServiecLayer("/b1s/v2/U_NCNFG" + filters, function (data) {
				if (data.value.length > 0) {
					$.each(data.value, function (i, e) {
						if (e.U_NFLDS === "WasteUOM") {
							var wasteUOM = e.U_NVALUE;
							if (wasteUOM !== "") {
								try {
									var wasteUOMJson = JSON.parse(wasteUOM);
									jsonModel.setProperty("/uomVals", wasteUOMJson);
								} catch (error) {
									sap.m.MessageToast.show(error);
								}
							}
						} else if (e.U_NFLDS === "SEED") {
							var SeedArr = e.U_NVALUE;
							if (SeedArr !== "") {
								try {
									var seedUOMJson = JSON.parse(SeedArr);
									jsonModel.setProperty("/createSeed", seedUOMJson);
								} catch (error) {
									sap.m.MessageToast.show(error);
								}
							}
						} else if (e.U_NFLDS === "SEEDLING") {
							var SeedlingsArr = e.U_NVALUE;
							if (SeedlingsArr !== "") {
								try {
									var seedlingeUOMJson = JSON.parse(SeedlingsArr);
									jsonModel.setProperty("/createSeedlings", seedlingeUOMJson);
								} catch (error) {
									sap.m.MessageToast.show(error);
								}
							}
						} else if (e.U_NFLDS === "CANNABIS PLANT") {
							var CannabissArr = e.U_NVALUE;
							if (CannabissArr !== "") {
								try {
									var CannabissUOMJson = JSON.parse(CannabissArr);
									jsonModel.setProperty("/cannabisLocationList", CannabissUOMJson);
								} catch (error) {
									sap.m.MessageToast.show(error);
								}
							}
						} else if (e.U_NFLDS === "COLLECTED FLOWER") {
							var ChangeGrowthPhase = e.U_NVALUE;
							if (ChangeGrowthPhase !== "") {
								try {
									var ChangeGrowthUOMJson = JSON.parse(ChangeGrowthPhase);
									jsonModel.setProperty("/flowerLocatonList", ChangeGrowthUOMJson);
								} catch (error) {
									sap.m.MessageToast.show(error);
								}
							}
						} else if (e.U_NFLDS === "CUTTING") {
							var Cuttings = e.U_NVALUE;
							if (Cuttings !== "") {
								try {
									var CuttingsUOMJson = JSON.parse(Cuttings);
									jsonModel.setProperty("/CuttingsLocatonList", CuttingsUOMJson);
								} catch (error) {
									sap.m.MessageToast.show(error);
								}
							}
						} else if (e.U_NFLDS === "RESIDUE") {
							var Residue = e.U_NVALUE;
							if (Residue !== "") {
								try {
									var ResidueUOMJson = JSON.parse(Residue);
									jsonModel.setProperty("ResidueLocatonList", ResidueUOMJson);
								} catch (error) {
									sap.m.MessageToast.show(error);
								}
							}
						}
					});
				}
			});
		},
		removeZeros: function (value) {
			if (value == 0) {
				return "";
			} else {
				return value;
			}
		},

		createBatchCall: function (batchUrl, callBack, busyDialog) {
			var jsonModel = this.getView().getModel("jsonModel");
			var splitBatch, count;
			count = Math.ceil(batchUrl.length / 100);
			jsonModel.setProperty("/count", count);
			if (batchUrl.length > 100) {
				do {
					splitBatch = batchUrl.splice(0, 100);
					this.callBatchService(splitBatch, callBack, busyDialog);
				} while (batchUrl.length > 100);
				if (batchUrl.length > 0) {
					this.callBatchService(batchUrl, callBack, busyDialog);
				}
			} else {
				this.callBatchService(batchUrl, callBack, busyDialog);
			}
		},
		callBatchService: function (batchUrl, callBack, busyDialog) {
			var reqHeader = "--clone_batch--\r\nContent-Type: application/http \r\nContent-Transfer-Encoding:binary\r\n\r\n";
			var payLoad = reqHeader;
			$.each(batchUrl, function (i, sObj) {
				payLoad = payLoad + sObj.method + " " + sObj.url + "\r\n\r\n";
				payLoad = payLoad + JSON.stringify(sObj.data) + "\r\n\r\n";
				if (batchUrl.length - 1 === i) {
					payLoad = payLoad + "\r\n--clone_batch--";
				} else {
					payLoad = payLoad + reqHeader;
				}
			});
			var that = this;
			var jsonModel = this.getOwnerComponent().getModel("jsonModel");
			var baseUrl = jsonModel.getProperty("/serLayerbaseUrl");
			//	var sessionID = jsonModel.getProperty("/sessionID");
			if (busyDialog) {
				busyDialog.setBusy(true);
			}
			if (location.host.indexOf("webide") === -1) {
				baseUrl = "";
			}
			var settings = {
				"url": baseUrl + "/b1s/v2/$batch",
				"method": "POST",
				xhrFields: {
					withCredentials: true
				},
				//"timeout": 0,
				"headers": {
					"Content-Type": "multipart/mixed;boundary=clone_batch"
				},
				//	setCookies: "B1SESSION=" + sessionID,
				"data": payLoad,
				success: function (res) {
					try {
						// Safely update the counter in the model
						const rawCount = jsonModel.getProperty("/count");
						const count = (Number.isFinite(rawCount) ? rawCount : parseInt(rawCount, 10)) - 1;
						jsonModel.setProperty("/count", count);
						const parts = that.parseODataBatchResponse(res) || [];
						// Log any status/summary for debugging
						if (parts.length === 0) {
							console.debug("Batch response contained no parts.");
						} else {
							parts.forEach((p, i) => {
								console.log(i, p.status, p.statusText, p.bodyJson ? "(json)" : "");
							});
						}

						// Find error parts (batch parts that indicate an error)
						const errorParts = parts.filter(p => p && p.isError);
						let errorMessage = [];
						let logData = {
							Api: "Batch calls",
							methodType: "POST",
							Desttype: "SL",
							errorText: errorMessage,
							data: payLoad,
							statusTxt: 200
						};
						if (errorParts.length > 0) {
							$.grep(errorParts, function (e) {
								errorMessage.push(that.getErrorMessage(e));
								console.error("Batch error:", errorMessage);
							});
							logData.errorText = errorMessage.join();
							logData.statusTxt = (errorParts[0] ? errorParts[0].status : null) || 400;
						} else {
							console.log("No errors found in batch response.");
						}

						// Persist a log (keeps same API as your original code)
						that.logBatchService(logData);

						// Append error message to model errorTxt array if present
						if (jsonModel.getProperty("/errorTxt").length > 0) {
							$.grep(jsonModel.getProperty("/errorTxt"), function (e) {
								errorMessage.push(e);
							});
						}
						if (errorMessage.length > 0) {
							jsonModel.setProperty("/errorTxt", errorMessage);
						}

						// If this was the last call, invoke callback and stop busy indicator
						if (count === 0) {
							// keep original call signature (callBack expects errorMessage)
							callBack.call(that, errorMessage);
							if (busyDialog && typeof busyDialog.setBusy === "function") {
								busyDialog.setBusy(false);
							}
						}
					} catch (err) {
						// Fall-back: ensure busyDialog is cleared and log the unexpected error
						console.error("Unexpected error in batch success handler:", err);
						try {
							that.CaptureLog({
								Api: "Batch calls",
								methodType: "POST",
								Desttype: "SL",
								errorText: err && err.message ? err.message : String(err),
								data: payLoad,
								statusTxt: 500
							});
						} catch (logErr) {
							console.error("Failed to CaptureLog:", logErr);
						}
						if (busyDialog && typeof busyDialog.setBusy === "function") {
							busyDialog.setBusy(false);
						}
						// If this was intended to finish the chain, call callback with an error string
						if (typeof callBack === "function") {
							callBack.call(that, err && err.message ? err.message : String(err));
						}
					}
				},
				error: function (error) {
					var count = jsonModel.getProperty("/count");
					count--;
					jsonModel.setProperty("/count", count);
					if (count === 0) {
						callBack.call(that);
						if (busyDialog) {
							busyDialog.setBusy(false);
						}
					}
					if (error.statusText) {
						MessageBox.error(error.statusText);
					} else if (error.responseJSON) {
						MessageBox.error(error.responseJSON.error.message.value);
					}
				}
			};
			$.ajax(settings).done(function () {
				//	console.log(response);
			});
		},
		parseODataBatchResponse: function (raw) {
			if (!raw || typeof raw !== 'string') return [];

			// 1. get boundary from the first line that looks like --batchresponse_...
			//    fallback: look for the first line starting with --
			const firstLineMatch = raw.match(/^(--[^\r\n]+)/m);
			if (!firstLineMatch) return [];

			const boundary = firstLineMatch[1].trim(); // e.g. --batchresponse_oyuuyTGs-...
			const parts = raw.split(boundary).map(p => p.trim()).filter(p => p && p !== '--');

			const results = parts.map(part => {
				// Each part may include headers and an HTTP response (application/http)
				// find the embedded HTTP response (starts with HTTP/1.1 ...)
				const httpMatch = part.match(/(HTTP\/\d\.\d\s+\d{3}.*)/s);
				if (!httpMatch) {
					// Some batch subparts might be simple non-http blocks; return raw
					return {
						status: null,
						statusText: null,
						headers: parseHeaders(part),
						bodyText: part,
						isError: false
					};
				}
				const httpSection = httpMatch[1];
				// Split status-line + headers + blank line + body
				// Status line is the first line of httpSection
				const lines = httpSection.split(/\r?\n/);
				const statusLine = lines[0].trim(); // e.g. HTTP/1.1 201 Created
				const statusMatch = statusLine.match(/^HTTP\/\d\.\d\s+(\d{3})\s*(.*)$/);

				const status = statusMatch ? parseInt(statusMatch[1], 10) : null;
				const statusText = statusMatch && statusMatch[2] ? statusMatch[2].trim() : null;

				// Find the blank line separating headers and body
				const headerBodySplit = httpSection.indexOf('\r\n\r\n');
				const headerBodySplitAlt = httpSection.indexOf('\n\n');
				const splitIndex = headerBodySplit >= 0 ? headerBodySplit : (headerBodySplitAlt >= 0 ? headerBodySplitAlt : -1);

				let headerText = '';
				let bodyText = '';
				if (splitIndex >= 0) {
					headerText = httpSection.substring(statusLine.length + 1, splitIndex).trim();
					bodyText = httpSection.substring(splitIndex + (httpSection[splitIndex] === '\r' ? 4 : 2)).trim();
				} else {
					// No blank line found - attempt a best-effort split: everything after status line is headers/body
					headerText = httpSection.substring(statusLine.length + 1).trim();
					bodyText = '';
				}

				const headers = {};
				if (!headerText) return headers;
				const lines2 = headerText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
				for (const line of lines2) {
					const idx = line.indexOf(':');
					if (idx > -1) {
						const name = line.substring(0, idx).trim().toLowerCase();
						const value = line.substring(idx + 1).trim();
						// For repeated headers, join with comma
						headers[name] = headers[name] ? `${headers[name]}, ${value}` : value;
					}
				}
				// Try parse JSON body if Content-Type indicates JSON or looks like JSON
				let bodyJson = null;
				try {
					if (bodyText && (/^\{/.test(bodyText) || /^\[/.test(bodyText) || /application\/json/i.test(headers['content-type'] || ''))) {
						bodyJson = JSON.parse(bodyText);
					}
				} catch (e) {
					// ignore parse error; keep bodyText
				}
				const isError = status >= 400 || (bodyJson && (bodyJson.error || bodyJson['odata.error']));
				return {
					status,
					statusText,
					headers,
					bodyText,
					bodyJson,
					isError
				};
			});
			return results;
		},
		logBatchService: function (batchUrl, callBack, busyDialog) {
			var reqHeader = "--clone_batch--\r\nContent-Type: application/http \r\nContent-Transfer-Encoding:binary\r\n\r\n";
			var payLoad = reqHeader;
			$.each(batchUrl, function (i, sObj) {
				payLoad = payLoad + sObj.method + " " + sObj.url + "\r\n\r\n";
				payLoad = payLoad + JSON.stringify(sObj.data) + "\r\n\r\n";
				if (batchUrl.length - 1 === i) {
					payLoad = payLoad + "\r\n--clone_batch--";
				} else {
					payLoad = payLoad + reqHeader;
				}
			});
			var that = this;
			var jsonModel = this.getOwnerComponent().getModel("jsonModel");
			var baseUrl = jsonModel.getProperty("/serLayerbaseUrl");
			//	var sessionID = jsonModel.getProperty("/sessionID");
			if (busyDialog) {
				busyDialog.setBusy(true);
			}
			if (location.host.indexOf("webide") === -1) {
				baseUrl = "";
			}
			var settings = {
				"url": baseUrl + "/b1s/v2/$batch",
				"method": "POST",
				xhrFields: {
					withCredentials: true
				},
				//"timeout": 0,
				"headers": {
					"Content-Type": "multipart/mixed;boundary=clone_batch"
				},
				//	setCookies: "B1SESSION=" + sessionID,
				"data": payLoad,
				success: function (res) {

				},
				error: function (error) {
					if (error.statusText) {
						MessageBox.error(error.statusText);
					} else if (error.responseJSON) {
						MessageBox.error(error.responseJSON.error.message.value);
					}
				}
			};
			$.ajax(settings).done(function () {
				//	console.log(response);
			});
		},
		errorHandler: function (error) {
			var that = this;
			var resText = JSON.parse(error.responseText).error.message.value;
			MessageBox.error(resText);
			that.getView().setBusy(false);
		},
		successHandler: function (text, resText) {
			MessageBox.success(text + resText + " created successfully", {
				closeOnNavigation: false,
				onClose: function () {}
			});
		},
		readServiecLayer: function (entity, callBack, busyDialog) {
			var that = this;
			var jsonModel = that.getOwnerComponent().getModel("jsonModel");
			var sessionID = jsonModel.getProperty("/sessionID");
			if (location.host.indexOf("webide") !== -1) {
				if (sessionID === undefined) {
					var loginPayLoad = jsonModel.getProperty("/userAuthPayload");
					loginPayLoad = JSON.stringify(loginPayLoad);
					if (busyDialog) {
						busyDialog.setBusy(true);
					}
					$.ajax({
						url: jsonModel.getProperty("/serLayerbaseUrl") + "/b1s/v2/Login",
						data: loginPayLoad,
						type: "POST",
						xhrFields: {
							withCredentials: true
						},
						dataType: "json", // expecting json response
						success: function (data) {
							that.getView().setBusy(false);
							jsonModel.setProperty("/sessionID", data.SessionId);
							//	var sessionID = that.getOwnerComponent().getModel("jsonModel").getProperty("/sessionID");
							$.ajax({
								type: "GET",
								xhrFields: {
									withCredentials: true
								},
								url: jsonModel.getProperty("/serLayerbaseUrl") + entity,
								setCookies: "B1SESSION=" + data.SessionId,
								dataType: "json",
								success: function (res) {
									if (busyDialog) {
										busyDialog.setBusy(false);
									}
									sap.ui.core.BusyIndicator.hide();
									callBack.call(that, res);
								},
								error: function (error) {
									if (busyDialog) {
										busyDialog.setBusy(false);
									}
									sap.ui.core.BusyIndicator.hide();
									MessageBox.error(error.responseJSON.error.message.value);
								}
							});
						},
						error: function () {
							that.getView().setBusy(false);
							sap.m.MessageToast.show("Error with authentication");
						}
					});
				} else {
					if (busyDialog) {
						busyDialog.setBusy(true);
					}
					$.ajax({
						type: "GET",
						xhrFields: {
							withCredentials: true
						},
						url: jsonModel.getProperty("/serLayerbaseUrl") + entity,
						//	setCookies: "B1SESSION=" + sessionID,
						dataType: "json",
						success: function (res) {
							if (busyDialog) {
								busyDialog.setBusy(false);
							}
							sap.ui.core.BusyIndicator.hide();
							callBack.call(that, res);
						},
						error: function (error) {
							if (busyDialog) {
								busyDialog.setBusy(false);
							}
							sap.ui.core.BusyIndicator.hide();
							MessageBox.error(error.responseJSON.error.message.value);
						}
					});
				}
			} else {
				if (busyDialog) {
					busyDialog.setBusy(true);
				}
				$.ajax({
					type: "GET",
					xhrFields: {
						withCredentials: true
					},
					url: entity,
					//	setCookies: "B1SESSION=" + sessionID,
					dataType: "json",
					success: function (res) {
						if (busyDialog) {
							busyDialog.setBusy(false);
						}
						sap.ui.core.BusyIndicator.hide();
						callBack.call(that, res);
					},
					error: function (error) {
						if (busyDialog) {
							busyDialog.setBusy(false);
						}
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(error.responseJSON.error.message.value);
					}
				});
			}
		},
		updateServiecLayer: function (entity, callBack, payLoad, method, busyDialog) {
			var that = this;
			var jsonModel = this.getOwnerComponent().getModel("jsonModel");
			payLoad = JSON.stringify(payLoad);
			if (busyDialog) {
				busyDialog.setBusy(true);
			}
			var sUrl;
			if (location.host.indexOf("webide") !== -1) {
				sUrl = jsonModel.getProperty("/serLayerbaseUrl") + entity;
			} else {
				sUrl = entity;
			}
			$.ajax({
				type: method,
				xhrFields: {
					withCredentials: true
				},
				url: sUrl,
				//	setCookies: "B1SESSION=" + sessionID,
				dataType: "json",
				data: payLoad,
				success: function (res) {
					if (busyDialog) {
						busyDialog.setBusy(false);
					}
					callBack.call(that, res);
					var docEntry;
					if (res == undefined) {
						docEntry = "";
					} else {
						docEntry = res.DocEntry;
					}
					var logData = {
						Api: entity,
						methodType: method,
						errorText: docEntry,
						data: payLoad,
						statusTxt: 200
					};
					that.CaptureLog(logData);
				},
				error: function (error) {
					if (busyDialog) {
						busyDialog.setBusy(false);
					}
					if (that._busyDialog) {
						that._busyDialog.close();
					}
					MessageBox.error(error.responseJSON.error.message);

					var logData = {
						Api: entity,
						methodType: method,
						errorText: error.responseJSON.error.message,
						data: payLoad,
						statusTxt: 400
					};
					that.CaptureLog(logData);
				}
			});
		},
		CaptureLog: function (LogData) {
			var jsonModel = this.getOwnerComponent().getModel("jsonModel");
			var that = this;
			var sUrl = LogData.Api,
				method = LogData.methodType,
				reqPayload = LogData.data,
				resPayload = LogData.errorText,
				statusCode = LogData.statusTxt;

			var payLoad = {
				U_NDTTM: this.convertUTCDate(new Date()),
				U_NUSID: jsonModel.getProperty("/userName"),
				U_NLGMT: method,
				U_NLURL: sUrl,
				U_NLGBD: JSON.stringify(reqPayload),
				U_NLGRP: JSON.stringify(resPayload),
				U_NLGST: statusCode,
				U_NAPP: "Pheno Track"
			};
			payLoad = JSON.stringify(payLoad);
			var sUrl, entity = "/b1s/v2/NBNLG";
			if (location.host.indexOf("webide") !== -1) {
				sUrl = jsonModel.getProperty("/serLayerbaseUrl") + entity;
			} else {
				sUrl = entity;
			}
			$.ajax({
				type: "POST",
				xhrFields: {
					withCredentials: true
				},
				url: sUrl,
				//	setCookies: "B1SESSION=" + sessionID,
				dataType: "json",
				data: payLoad,
				success: function (res) {},
				error: function (error) {}
			});
		},

		/*Methods for multiInput for sarch field for scan functionality start*/
		onSubmitMultiInput: function (oEvent) {
			oEvent.getSource()._bUseDialog = false;
			var value = oEvent.getSource().getValue();
			if (!value) {
				this.fillFilterLoad(oEvent.getSource());
				return;
			}
			value = value.replace(/\^/g, "");
			oEvent.getSource().addToken(new sap.m.Token({
				key: value,
				text: value
			}));
			var orFilter = [];
			var andFilter = [];
			oEvent.getSource().setValue("");
			this.fillFilterLoad(oEvent.getSource());
		},
		tokenUpdateMultiInput: function (oEvent) {
			this.fillFilterLoad(oEvent.getSource(), oEvent.getParameter("removedTokens")[0].getText());
		},
		onChangeMultiInput: function (oEvent) {
			oEvent.getSource()._bUseDialog = false;
			var value = oEvent.getSource().getValue();
			if (value.indexOf("^") !== -1) {
				value = value.replace(/\^/g, "");
				oEvent.getSource().addToken(new sap.m.Token({
					key: value,
					text: value
				}));
				var orFilter = [];
				var andFilter = [];
				oEvent.getSource().setValue("");
				this.fillFilterLoad(oEvent.getSource());
			}
		},
		convertUTCDate: function (date) {
			date.setHours(new Date().getHours());
			date.setMinutes(new Date().getMinutes());
			date.setSeconds(new Date().getSeconds());
			var utc = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
			return utc;
		},
		convertUTCDateTime: function (date) {
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddThh:mm:ss",
				UTC: true
			});
			var postingDate = dateFormat.format(new Date(date));
			var finalDate = postingDate + "Z";
			return finalDate;
		},
		addLeadingZeros: function (num, size) {
			num = num.toString();
			while (num.length < size) num = "0" + num;
			return num;
		},
		generateCloneBatchID: function (text, strainID, data) {
			var maxValue, returnValue;
			if (data.length > 0) {
				var existingBatches = $.grep(data, function (e) {
					if (e.IntrSerial != null) {
						if (e.IntrSerial.search(strainID) > -1) {
							return e;
						}
					}
				});
				if (existingBatches.length > 0) {
					maxValue = Math.max.apply(Math, existingBatches.map(function (existingBatches) {
						var bId = existingBatches.IntrSerial.split("-")[existingBatches.IntrSerial.split("-").length - 1];
						returnValue = bId.replace(/^\D+/g, '');
						return returnValue;
					}));
				} else {
					maxValue = 0;
				}
			} else {
				maxValue = 0;
			}
			var n, s, id;
			for (n = maxValue; n <= (maxValue + 1); n++) {
				s = n + "";
				id = text + "-" + strainID + "-B" + s;
			}
			return id;
		},
		generateClonePlantID: function (text, strainID, data) {
			var maxValue, returnValue;
			if (data.length > 0) {
				var existingBatches = $.grep(data, function (e) {
					if (e.BatchNum != null) {
						if (e.BatchNum.search(strainID) > -1) {
							return e;
						}
					}
				});
				if (existingBatches.length > 0) {
					maxValue = Math.max.apply(Math, existingBatches.map(function (existingBatches) {
						var bId = existingBatches.BatchNum.split("-")[existingBatches.BatchNum.split("-").length - 1];
						returnValue = bId.replace(/^\D+/g, '');
						return returnValue;
					}));
				} else {
					maxValue = 0;
				}
			} else {
				maxValue = 0;
			}
			var n, s, id;
			for (n = maxValue; n <= (maxValue + 1); n++) {
				s = n + "";
				//while (s.length < 3) s = "0" + s;
				id = text + "-" + strainID + "-" + s;
				var obj = {
					BatchNum: id
				};
				data.push(obj);
			}
			return id;
		},
		generatePackageBatchID: function (text, strainID, data) {
			var maxValue, returnValue;
			if (data.length > 0) {
				var existingBatches = $.grep(data, function (e) {
					if (e.BatchNum != null) {
						if (e.BatchNum.search(strainID) > -1) {
							return e;
						}
					}
				});
				if (existingBatches.length > 0) {
					maxValue = Math.max.apply(Math, existingBatches.map(function (existingBatches) {
						var bId = existingBatches.BatchNum.split("-")[existingBatches.BatchNum.split("-").length - 1];
						returnValue = bId.replace(/^\D+/g, '');
						return returnValue;
					}));
				} else {
					maxValue = 0;
				}
			} else {
				maxValue = 0;
			}
			var n, s, id;
			for (n = maxValue; n <= (maxValue + 1); n++) {
				s = n + "";
				id = text + "-" + strainID + "-P" + s;
			}
			return id;
		},
		generateLabels: function (text, data) {
			var labelCode = "RES";
			var maxValue, returnValue;
			if (data.length > 0) {
				var existingBatches = $.grep(data, function (e) {
					if (e.U_NWTLB != null) {
						if (e.U_NWTLB.search(labelCode) > -1) {
							return e;
						}
					}
				});
				if (existingBatches.length > 0) {
					maxValue = Math.max.apply(Math, existingBatches.map(function (existingBatches) {
						var bId = existingBatches.U_NWTLB.split("-")[existingBatches.U_NWTLB.split("-").length - 1];
						returnValue = bId.replace(/^\D+/g, '');
						return returnValue;
					}));
				} else {
					maxValue = 0;
				}
			} else {
				maxValue = 0;
			}
			var n, s, id;
			for (n = maxValue; n <= (maxValue + 1); n++) {
				s = n + "";
				id = text + "-" + labelCode + "-" + s;
			}
			return id;
		},
		onChanageNavigate: function () {
			var jsonModel = this.getOwnerComponent().getModel("jsonModel");
			var serLayerTargetUrl = jsonModel.getProperty("/target");
			var pageTo = this.byId("navigate").getSelectedKey();
			var AppNavigator;
			if (pageTo === "Strain") {
				AppNavigator = serLayerTargetUrl.Strain;
			}
			if (pageTo === "PhenoTrack") {
				AppNavigator = serLayerTargetUrl.PhenoTrack;
			}
			if (pageTo === "MicroPropagation") {
				AppNavigator = serLayerTargetUrl.MicroPropagation;
			}
			if (pageTo === "MacroPropagation") {
				AppNavigator = serLayerTargetUrl.MacroPropagation;
			}
			if (pageTo === "MotherPlanner") {
				AppNavigator = serLayerTargetUrl.MotherPlanner;
			}
			if (pageTo === "Cultivation") {
				AppNavigator = serLayerTargetUrl.Cultivation;
			}
			if (pageTo === "DestroyedPlants") {
				AppNavigator = serLayerTargetUrl.DestroyedPlants;
			}
			if (pageTo === "Waste") {
				AppNavigator = serLayerTargetUrl.Waste;
			}
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"); // get a handle on the global XAppNav service
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: AppNavigator
				}
			});
		}

	});
});