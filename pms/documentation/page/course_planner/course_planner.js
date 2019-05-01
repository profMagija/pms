
frappe.pages['course-planner'].on_page_load = async function (wrapper) {

	var course = frappe.get_route()[1];
	if (!course) return;
	var cdoc = frappe.get_doc('Course', course) || frappe.db.get_doc('Course', course);

	if (!cdoc)
		return;

	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Course Planner: ' + course,
		single_column: true
	});

	page.add_inner_button('Back to Course', function () {
		frappe.set_route('Form', 'Course', course);
	})

	page.add_inner_button('Refresh', function () {
		page.calendar && page.calendar.refresh();
	})

	function event_filter(ca) {
		var title;
		if (ca.extra) {
			title = ca.activity_title + "\n" + ca.extra;
		} else {
			title = ca.activity_title;
		}

		return {
			start: ca.time_form,
			end: ca.time_to,
			allDay: false,
			title: title,
			id: ca.name
		};
	}
	frappe.model.with_doctype('Course Activity', () => {
		frappe.require([
			'assets/frappe/js/lib/fullcalendar/fullcalendar.min.css',
			'assets/frappe/js/lib/fullcalendar/fullcalendar.min.js',
			'assets/frappe/js/lib/fullcalendar/locale-all.js'
		], () => {
			var $calendar = page.add_view('Calendar', '<div>');
			$calendar.show();
			page.calendar = new frappe.views.Calendar({
				parent: $calendar,
				doctype: 'Course Activity',
				page: page,
				get_args: function (start, end) {
					return {
						doctype: this.doctype,
						start: this.get_system_datetime(start),
						end: this.get_system_datetime(end),
						course: course,
					}
				},
				field_map: {
					"start": "time_from",
					"end": "time_to",
					"id": "name",
					"title": function (data) { return data.activity_title + "\n" + (data.extra || ""); },
					"description": "extra",
					"allDay": data => false,
					"editable": data => true,
					"data": data => data
				},
				quickEntry: true,
				get_events_method: "pms.documentation.doctype.course_activity.course_activity.get_events",
				options: {

					defaultView: 'agendaWeek',
					defaultDate: cdoc.start_date,
					header: {
						left: 'title',
						center: '',
						right: 'prev,today,next'
					},
					minTime: "04:00:00",
					maxTime: "28:00:00",
					height: 650,

					eventClick(event) {
						var dialog = new frappe.ui.Dialog({
							title: __("Edit {0}", [event.data.activity_title]),
							fields: [
								{ fieldname: 'activity', label: 'Activity', fieldtype: 'Link', options: 'Activity', reqd: 1 },
								{ fieldname: 'activity_title', label: 'Activity Title', fieldtype: 'Read Only', fetch_from: 'activity.title' },
								{ fieldname: 'extra', label: 'Extra', fieldtype: 'Data' },
								{ fieldname: 'time_from', label: 'From', fieldtype: 'Datetime' },
								{ fieldname: 'time_to', label: 'To', fieldtype: 'Datetime' },
								{ fieldname: 'color', label: 'Color', fieldtype: 'Color' }
							],
							action: {
								primary: {
									label: __("Save"),
									onsubmit: function (values) {
										if (event.data.data == event.data) {
											event.data.data = undefined;
										}
										frappe.call('frappe.client.save', {
											doc: Object.assign({}, { doctype: 'Course Activity', docname: event.id }, event.data, values)
										}).then(() => {
											page.calendar.refresh();
										})
										dialog.hide();
									}
								},

								secondary: {
									label: __("Discard")
								}
							}
						});

						dialog.set_values(event.data);
						var btn = $(`<button class="btn btn-danger">Delete this Activity</button>`);
						btn.click(async function () {
							var crs = await frappe.db.get_doc('Course', course);
							crs.activities = crs.activities.filter(x => x.name != event.data.name);
							frappe.call('frappe.client.save', {
								doc: crs
							}).then(() => {
								page.calendar.refresh();
							})
							dialog.hide();
						})
						dialog.$body.append(btn);
						dialog.show();
					},

					select(start, end) {
						var dialog = new frappe.ui.Dialog({
							title: __("New activity"),
							fields: [
								{ fieldname: 'activity', label: 'Activity', fieldtype: 'Link', options: 'Activity', reqd: 1 },
								{ fieldname: 'activity_title', label: 'Activity Title', fieldtype: 'Read Only', fetch_from: 'activity.title' },
								{ fieldname: 'extra', label: 'Extra', fieldtype: 'Data' },
								{ fieldname: 'time_from', label: 'From', fieldtype: 'Datetime' },
								{ fieldname: 'time_to', label: 'To', fieldtype: 'Datetime' },
								{ fieldname: 'color', label: 'Color', fieldtype: 'Color' }
							],
							action: {
								primary: {
									label: __("Save"),
									onsubmit: async function (values) {
										var crs = await frappe.db.get_doc('Course', course);
										crs.activities.push(values);
										frappe.call('frappe.client.save', {
											doc: crs
										}).then(() => {
											page.calendar.refresh();
										})
										dialog.hide();
									}
								},

								secondary: {
									label: __("Discard")
								}
							}
						});

						debugger;
						dialog.set_values({
							'time_from': start.locale("en").format("YYYY-MM-DD HH:mm:ss"),
							'time_to': end.locale("en").format("YYYY-MM-DD HH:mm:ss")
						});
						dialog.show();
					}
				}
			});
		});
	});

}