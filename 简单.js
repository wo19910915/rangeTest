//内嵌基本元素
	function init_BASE() {
		var setting_base = {
			view : {
				addHoverDom : addHoverDom,
				removeHoverDom : removeHoverDom,
				selectedMulti : false,
				showTitle : true
			},
			async : {
				enable : true,
				url : "getBaseTreeInfo.do",
				autoParam : [ "id" ],
				otherParam : {
				},
				dataFilter : filter
			},
			edit : {
				enable : true,
				editNameSelectAll : true,
				showRemoveBtn : showRemoveBtn,
				showRenameBtn : showRenameBtn
			},
			data : {
				simpleData : {
					enable : true
				},
				key : {
					title : "title"
				}
			},
			callback : {
				beforeClick : beforeClick,
				onClick : onClick,
				onDblClick : onDblClick,
				beforeDrag : beforeDrag,
				beforeEditName : beforeEditName,
				beforeRemove : beforeRemove,
				beforeRename : beforeRename,
				onRemove : onRemove,
				onRename : onRename,
				onAsyncError : onAsyncError,
				onAsyncSuccess : onAsyncSuccess
			}
		};

		function beforeClick(treeId, treeNode, clickFlag) {
			return (treeNode.click != false);
		}
		function onClick(event, treeId, treeNode, clickFlag) {
		}


		function onDblClick(event, treeId, treeNode, clickFlag) {
			//双击插入基本元素
			insertBEInfo(treeNode);
		}
		function insertBEInfo(treeNode) {
			//插入基本元素
			if (treeNode.isParent) {
				return;
			}
			var rtn = false;
			//1获取简单元素节点属性 2判断取值来源 3判断取值类型赋值显示		
			$.ajax({
				type : "post",
				url : "getBEInfo.do",
				data : {
					"ELEMENTID" : treeNode.id
				},
				async : false,
				dataType : "json",
				success : function(data, textStatus, jqXHR) {
					if (data.code == 200) {
						var bes = JSON.parse(data.obj);
						if (bes.length == 0) {
							$(this).alertmsg('warn', '简单元素节点：【' + treeNode.name + '】 尚未维护节点属性信息！');
							return false;
						}
						var be = bes[0]; //取第一条 
						if (be.inputType == undefined || be.inputType == "") {
							$(this).alertmsg('warn', '简单元素节点：【' + be.elementName + '】 尚未维护节点【输入类型】属性信息！');
							return false;
						}
						if (be.valSource == undefined || be.valSource == "") {
							$(this).alertmsg('warn', '简单元素节点：【' + be.elementName + '】 尚未维护节点【取值来源】属性信息！');
							return false;
						}
						//model属性
						var ce_model = {};
						ce_model.elementId = be.elementId;
						ce_model.elementName = be.elementName;
						ce_model.valSource = be.valSource;
						ce_model.inputType = be.inputType;
						ce_model.textDefault = "";
						ce_model.numDefault = -1;
						ce_model.numLimSign = "0";
						ce_model.numUpLim = -1;
						ce_model.numLowLim = -1;
						ce_model.cBoxSymbol = ",";
						ce_model.displayValue = be.elementName;

						if (be.textDefault) {
							ce_model.textDefault = be.textDefault;
							ce_model.displayValue = be.textDefault;
						}
						if (be.numDefault) {
							ce_model.numDefault = be.numDefault;
							ce_model.displayValue = be.numDefault;
						}
						if (be.numLimSign) {
							ce_model.numLimSign = be.numLimSign;
						}
						if (be.numUpLim) {
							ce_model.numUpLim = be.numUpLim;
						}
						if (be.numLowLim) {
							ce_model.numLowLim = be.numLowLim;
						}
						if (be.cBoxSymbol) {
							ce_model.cBoxSymbol = be.cBoxSymbol;
						}

						// 0-文本 1-数值 2-日期 3-单选 4-多选
						if (ce_model.inputType == "0") {
							ce_model.levelplugins = "level_text";
						} else if (ce_model.inputType == "1") {
							ce_model.levelplugins = "level_number";
						} else if (ce_model.inputType == "2") {
							ce_model.levelplugins = "level_date";
						} else if (ce_model.inputType == "3") {
							ce_model.levelplugins = "level_single";
						} else if (ce_model.inputType == "4") {
							ce_model.levelplugins = "level_multi";
						}

						var ce_window = document.getElementById("ce_edit").contentWindow;
						var ce_editor = ce_window.UE.getEditor('editor');
						ce_editor.focus();
						ce_editor.execCommand("insertHTML",

							'<div levelplugins="element" style="display:inline-block;">'

							+ '<div levelplugins="leftbrackets" style="display:inline-block;" class="bgcolor">[</div>'

							+ '<div contenteditable="false" style="display:inline-block;" class="bgcolor">'
							+ '<div contenteditable="true" id="' + ce_model.elementId + '" title="' + ce_model.elementName + '" style="color:#000000;" levelplugins="' + ce_model.levelplugins + '" level-model="' + unhtml(JSON.stringify(ce_model)) + '">' + be.elementName + '</div>'
							+ '</div>'


							+ '<div levelplugins="rightbrackets" style="display:inline-block;" class="bgcolor">]</div>'

							+ "</div>"


						);
					}
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {
					$(this).alertmsg('error', '复合元素->获取基本元素信息失败!');
				}
			});
		}

		function onAsyncError(event, treeId, treeNode, XMLHttpRequest, textStatus, errorThrown) {
		}

		function onAsyncSuccess(event, treeId, treeNode, msg) {
			var zTree = $.fn.zTree.getZTreeObj(NODE_BASE.ul_id);
			zTree.expandAll(false);
		}

		function filter(treeId, parentNode, childNodes) {
			if (!childNodes) return null;
			return JSON.parse(childNodes);
		}

		function beforeDrag(treeId, treeNodes) {
			return false;
		}
		function beforeEditName(treeId, treeNode) {
			var zTree = $.fn.zTree.getZTreeObj(NODE_BASE.ul_id);
			zTree.selectNode(treeNode);
			zTree.editName(treeNode);
			return false;
		}

		function beforeRename(treeId, treeNode, newName, isCancel) {
			if (newName.length == 0) {
				setTimeout(function() {
					var zTree = $.fn.zTree.getZTreeObj(NODE_BASE.ul_id);
					zTree.cancelEditName();
					alert("节点名称不能为空!");
				}, 0);
				return false;
			}
			return true;
		}
		function onRename(e, treeId, treeNode, isCancel) {
		}

		function refreshParentNode(parentTId) {
			var zTree = $.fn.zTree.getZTreeObj(NODE_BASE.ul_id),
				type = "refresh",
				silent = false;
			/*根据 zTree 的唯一标识 tId 快速获取节点 JSON 数据对象*/
			var parentNode = zTree.getNodeByTId(parentTId);
			/*选中指定节点*/
			zTree.selectNode(parentNode);
			zTree.reAsyncChildNodes(parentNode, type, silent);
		}

		function beforeRemove(treeId, treeNode) {
			var zTree = $.fn.zTree.getZTreeObj(NODE_BASE.ul_id);
			zTree.selectNode(treeNode);
			return confirm("确认删除 节点[" + treeNode.name + "]?");
		}
		function onRemove(e, treeId, treeNode) {
		}

		function showRemoveBtn(treeId, treeNode) {
			return false;
		}
		function showRenameBtn(treeId, treeNode) {
			return false;
		}

		function addHoverDom(treeId, treeNode) {
		}
		function removeHoverDom(treeId, treeNode) {
		}


		function init() {
			var rtn = {};
			rtn.setting = setting_base;
			rtn.refreshParentNode = refreshParentNode;
			return rtn;
		}
		window.NODE_BASE = init();

	}