'use strict';

const socket = io();

socket.on('add', data => {
    vm.employees.push(data);
})

socket.on('update', data => {
    vm.fetchEmployees();
})

socket.on('delete', data => {
    vm.fetchEmployees();
})

const commands = [
    {
        indexes: ["reload", "refresh", "sync", "clear"], // These spoken words will trigger the execution of the command
        action(i) { // Action to be executed when a index match with spoken word
            if(i == 3) {
                vm.search = "";
            } else {
                vm.fetchEmployees();
            }
        }
    },
    {
        indexes: ["search *", "find *"],
        smart: true,
        action(i, wildcard) {
            vm.search = wildcard;
        }
    }
];

artyom.addCommands(commands); // Add the command with addCommands method. Now

function startContinuousArtyom() {
    artyom.fatality(); // use this to stop any of

    setTimeout(() => { // if you use artyom.fatality , wait 250 ms to initialize again.
        artyom.initialize({
            lang: "en-US", // A lot of languages are supported. Read the docs !
            continuous: true, // Artyom will listen forever
            listen: true, // Start recognizing
            debug: false, // Show everything in the console
            speed: 1 // talk normally
        }).then(() => {
            console.log("Ready to work !");
        });
    }, 250);
}

var vm = new Vue({
    el: "#app",
    delimiters: ['[[', ']]'],
    data: {
        search: "",
        employeeContainer: false,
        loader: true,
        addEmployeeModal: false,
        employees: [],
        fields: ["name", "email", "contact", "fnm", "Spouse", "gender", "nation", "address"],
        selectedField: null,
        employee: {
            name: null,
            email: null,
            contact: null,
            fnm: null,
            Spouse: null,
            gender: null,
            nation: null,
            address: null
        },
        add_error: false,
        editEmployeeModal: false
    },
    created() {
        this.fetchEmployees();
        startContinuousArtyom();
    },
    methods: {
        fetchEmployees() {
            this.loader = true;
            this.employeeContainer = false;
            axios.get('/api/employees').then(response => {
                vm.employees = response.data;
                vm.loader = false;
                vm.employeeContainer = true;
            }).catch(error => {
                console.log(error);
            })
        },
        openAddEmployeeModal() {
            this.addEmployeeModal = true;
        },
        closeAddEmployeeModal() {
            this.addEmployeeModal = false;
            this.clearEmployeeModel();
        },
        clearEmployeeModel() {
            this.employee = {
                name: null,
                email: null,
                contact: null,
                fnm:null,
                Spouse:null,
                gender:null,
                nation:null,
                address:null
            }
        },
        addEmployee() {
            if (!this.employee.name || !this.employee.email || !this.employee.contact ) {
                console.log('aaa');
                // alert('a');
                this.add_error = true;
                setTimeout(() => {
                    vm.add_error = false;
                }, 4000);
                return false;
            }
            axios.post('/api/employees', this.employee).then(response => {
                const res = response.data;
                if (res.success) {
                    socket.emit('add', res.doc); //real-time adding
                    vm.clearEmployeeModel();
                } else {
                    console.log(res.message);
                }
            }).catch(error => {
                console.log(error);
            })
        },
        openEditEmployeeModal(data) {
            this.employee = Object.assign({}, data);;
            this.editEmployeeModal = true;
        },
        closeEditEmployeeModal() {
            this.editEmployeeModal = false;
            this.clearEmployeeModel();
        },
        updateEmployee(_id) {
            axios.put('/api/employees', this.employee).then(response => {
                const res = response.data;
                if (res.success) {
                    socket.emit('update', true); //real-time updating
                } else {
                    console.log(res.message);
                }
            }).catch(error => {
                console.log(error);
            })
        },
        removeEmployee(_id) {
            axios.delete(`/api/employees/${_id}`).then(response => {
                const res = response.data;
                if (res.success) {
                    socket.emit('delete', true); //real-time updating
                } else {
                    console.log(res.message);
                }
            }).catch(error => {
                console.log(error);
            })
        }
    }
})
