import frappe

def setup_defaults(*args):
    records = [{
        'doctype': 'Activity',
        'name': 'AP-{}'.format(n),
        'title': t,
        'type': 'Predefined'
    } for t, n in [('Doručak', 0), ("Ručak", 1), ("Večera", 2)]]

    records += [{
        'doctype': 'Associate Status',
        'status': t,
        'wage': w
    } for t, w in [('Asistent', 850), ('Mentor', 1700), ('Stručni Saradnik', 850), ('Saradnik Predavač', 1700)]]

    for record in records:
        doc = frappe.new_doc(record.get("doctype"))
        doc.update(record)

        try:
            doc.insert(ignore_permissions=True)
        except frappe.DuplicateEntryError as e:
            pass