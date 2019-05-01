// Copyright (c) 2019, profmagija and contributors
// For license information, please see license.txt

frappe.ui.form.on('Travel Warrant', {
	refresh (frm) {
		frm.trigger('course');
		frm.trigger('associate');
	},

	async course (frm) {
		if (!frm.doc.course) return;
		var course = await frappe.db.get_doc("Course", frm.doc.course);

		frm.__course = course;
		if (!course) return;
		frm.set_value('course_name', (await frappe.db.get_doc("Program", course.program)).long_name);
		frm.set_value('course_code', course.name);
		frm.set_value('course_start', course.start_date);
		frm.set_value('course_end', course.end_date);
		frm.set_value('course_manager', course.manager_full_name);

		frm.trigger('update_either');
	},

	async associate (frm) {
		if (!frm.doc.associate) return;
		var asoc = await frappe.db.get_doc("Associate", frm.doc.associate);

		frm.__asoc = asoc;
		if (!asoc) return;

		function format_addr(line1, line2, city, zip, country) {
			var s = [line1, line2, zip && city && zip + " " + city].filter(x => x && x.length > 0).join(', ');
			if (s.length == 0)
				return null;
			return s;
		}

		frm.set_value('full_name', asoc.last_name + " " + asoc.first_name);
		frm.set_value('jmbg', asoc.jmbg);
		frm.set_value('perm_addr', format_addr(
			asoc.perm_addr_1, asoc.perm_addr_2, asoc.perm_city, asoc.perm_zip, asoc.perm_country
		));
		frm.set_value('temp_addr', format_addr(
			asoc.temp_address_line_1, asoc.temp_address_line_2, asoc.temp_city, asoc.temp_zip_code, asoc.temp_country
		));
		frm.set_value('id_card_no', asoc.id_card_number);
		frm.set_value('id_card_issuer', asoc.id_card_issuer);
		frm.set_value('phone_no', asoc.phone);

		frm.trigger('update_either')
	},

	async update_either (frm) {
		var asoc = frm.__asoc;
		var course = frm.__course;
		if (!asoc || !course) return;

		var course_asocs = course.associates.filter(x => x.associate == asoc.name);
		if (course_asocs.length == 0)
		{
			frappe.msgprint('No such assistant at course', 'Uh oh!');
		}

		var course_asoc = course_asocs[0];

		var status = await frappe.db.get_doc("Associate Status", course_asoc.associate_status);

		frm.set_value('arrival_time', course_asoc.arrival_time);
		frm.set_value('departure_time', course_asoc.departure_time);
		frm.set_value('assoc_status', status.name);
		frm.set_value('date', frappe.datetime.nowdate());

		var hours = Math.floor(((new Date(course_asoc.departure_time) - new Date(course_asoc.arrival_time)) / (1000 * 60 * 60)))
		var wages = Math.ceil(hours / 12) / 2;

		frm.set_value('num_hours', hours);
		frm.set_value('wage', status.wage);
		frm.set_value('num_wages', wages);
		frm.set_value('wage_total', wages * Number(status.wage));

		frm.trigger('recalculate_accontation');
	},

	public_transport (frm) {
		frm.trigger('recalculate_accontation');
	},

	total_distance (frm) {
		frm.trigger('recalculate_accontation');
	},

	gas_price (frm) {
		frm.trigger('recalculate_accontation');
	},

	other_expenses (frm) {
		frm.trigger('recalculate_accontation');
	},

	received (frm) {
		frm.trigger('recalculate_accontation');
	},

	recalculate_accontation (frm) {
		var s = Number(frm.doc.wage_total || 0);

		var transp_total = 0;

		if (frm.doc.public_transport) {
		
			frm.doc.public_transport.forEach(pt => {
				transp_total += Number(pt.price || 0);
			})
		}

		if (frm.doc.total_distance && frm.doc.gas_price) {
			transp_total += Number(frm.doc.total_distance) * Number(frm.doc.gas_price);
		}

		var other_total = 0;

		if (frm.doc.other_expenses) {
			frm.doc.other_expenses.forEach(pt => {
				other_total += Number(pt.ammount || 0);
			})
		}

		s += transp_total + other_total;

		frm.set_value('transport_total', transp_total);
		frm.set_value('other_total', other_total);
		frm.set_value('total', s);
		frm.set_value('remains', s - Number(frm.doc.received));
	}
});
