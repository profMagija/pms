// Copyright (c) 2019, profmagija and contributors
// For license information, please see license.txt

frappe.ui.form.on('Course', {
	async refresh (frm) {

		if (!frm.doc.__islocal) {
			frm.add_custom_button('Activity Calendar', function() {
				frappe.set_route('course-planner', frm.doc.name)
			});

			frm.add_custom_button('Add Meals', function() {
				frappe.call({
					doc: frm.doc,
					method: 'create_meals'
				}).then(() => frm.refresh())
			});
		}
	}
});

function time_to_date(time) {
	return frappe.datetime.str_to_obj(time);
}

frappe.ui.form.handlers['Course Associate'] = {
	create_travel_warrant: [
		async function(frm, doctype, docname) {
			var course_assoc = frappe.get_doc(doctype, docname);
			var tw = await frappe.new_doc("Travel Warrant", {
				course: frm.doc.name,
				associate: course_assoc.associate
			});
		}
	]
}
