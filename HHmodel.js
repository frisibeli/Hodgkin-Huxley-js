var HodgkinHuxley = function(){
	this.G_K  	 = 36;
	this.G_Na 	 = 120;
	this.G_L	 = 0.3;
	this.V_K 	 = -12;
	this.V_Na	 = 115;
	this.V_L	 = 10.6;
	this.C		 = 1;
}

HodgkinHuxley.prototype.AlphaN = function(V) {
	if (V===10) V+=0.001;
	return 0.01 * ( (10-V) / (Math.exp((10-V)/10)-1) );
};
HodgkinHuxley.prototype.BetaN = function(V) {
	return 0.125*Math.exp(-V/80);
};
HodgkinHuxley.prototype.AlphaM = function(V) {
	return 0.1*( (25-V) / (Math.exp((25-V)/10)-1) );
};
HodgkinHuxley.prototype.BetaM = function(V) {
	return 4*Math.exp(-V/18);
};
HodgkinHuxley.prototype.AlphaH = function(V) {
	return 0.07*Math.exp(-V/20);
};
HodgkinHuxley.prototype.BetaH = function(V) {
	return 1/(Math.exp((30-V)/10)+1);
};
HodgkinHuxley.prototype.m0 = function(V) {
	return this.AlphaM(V)/(this.AlphaM(V)+this.BetaM(V));
};
HodgkinHuxley.prototype.n0 = function(V) {
	return this.AlphaN(V)/(this.AlphaN(V)+this.BetaN(V));
};
HodgkinHuxley.prototype.h0 = function(V) {
	return this.AlphaH(V)/(this.AlphaH(V)+this.BetaH(V));
};
HodgkinHuxley.prototype.tauM = function(V) {
	return 1/(this.AlphaM(V)+this.BetaM(V));
};
HodgkinHuxley.prototype.tauN = function(V) {
	return 1/(this.AlphaN(V)+this.BetaN(V));
};
HodgkinHuxley.prototype.tauH = function(V) {
	return 1/(this.AlphaH(V)+this.BetaH(V));
};
HodgkinHuxley.prototype.model2 = function() {
	var timeInterval = 35;
	var spaceInterval = 30;
	var Nt = 4500;
	var Nx = 200;
	var dt = timeInterval/Nt;
	var dx = spaceInterval/Nx;

	var V = [];
	var m = [];
	var n = [];
	var h = [];

	var I_K = 0;
	var I_Na = 0;
	var I_L = 0;
	var I_ext = 0;
	var I_ion = 0;

	for (var i = 0; i <Nx; i++) {
		V[i] = [];
		m[i] = [];
		n[i] = [];
		h[i] = [];
		for (var j = 0; j < Nt-1; j++) {
			V[i][j] = 0;
			m[i][j] = 0;
			n[i][j] = 0;
			h[i][j] = 0;
		};
	}

	for (var j = 0; j < Nt; j++) {
		V[0][j] = 50*Math.sin(0.5*j*dt);
	};

	for (var i = 0; i <Nx; i++) {
		m[i][0] = this.m0(V[i][0]);
		n[i][0] = this.n0(V[i][0]);
		h[i][0] = this.h0(V[i][0]);
	}	

	
	for (var j = 0; j < Nt-1; j++) {
		for (var i = 1; i < Nx - 1; i++) {
			// if((j >= 60 && j<= 200) && (i >= 0 && i<= 10)) I_ext = -50;
			// else I_ext = 0;
			m[i][j+1] = m[i][j] - (dt*(m[i][j]-this.m0(V[i][j])))/this.tauM(V[i][j]);
			n[i][j+1] = n[i][j] - (dt*(n[i][j]-this.n0(V[i][j])))/this.tauN(V[i][j]);
			h[i][j+1] = h[i][j] - (dt*(h[i][j]-this.h0(V[i][j])))/this.tauH(V[i][j]);
			I_Na = this.G_Na*Math.pow(m[i][j], 3)*h[i][j]*(V[i][j]-this.V_Na);
			I_K = this.G_K*Math.pow(n[i][j], 4)*(V[i][j]-this.V_K);
			I_L = this.G_L*(V[i][j]-this.V_L);
			I_ion = I_Na + I_K + I_L + I_ext;
			//without R
			V[i][j+1] = (dt/Math.pow(dx,2))*(V[i+1][j] - 2*V[i][j] + V[i-1][j]) + V[i][j] - dt*I_ion;
			// if(i == 1) V[0][j+1] = V[1][j+1];
		};
	};
	var Vtemp = [];
	for (var j = 0; j < Nt; j++) {
		Vtemp[j] = [];
		for (var i = 0; i < Nx; i++) {
			Vtemp[j][i] = V[i][j];
		}
	}
	return Vtemp;


};
HodgkinHuxley.prototype.model = function() {
	var timeInterval = 15;
	var N = 5000;
	var dt = timeInterval/N;

	var V = 0;
	var m = this.m0(V);
	var n = this.n0(V);
	var h = this.h0(V);
	var I_K = 0;
	var I_Na = 0;
	var I_L = 0;
	var I_ext = 0;
	var I_ion = 0;
	var result = {
		V:[],
		m:[],
		n:[],
		h:[],
		m0:[],
		n0:[],
		h0:[],
		I_Na:[],
		I_K:[]
	}
	for (var i = 0; i < N; i++) {
		if(i => 500 && i <= 1000) I_ext = 3;
		else I_ext = 0;
		m = m - (dt*(m-this.m0(V)))/this.tauM(V);
		n = n - (dt*(n-this.n0(V)))/this.tauN(V);
		h = h - (dt*(h-this.h0(V)))/this.tauH(V);
		I_Na = this.G_Na*Math.pow(m, 3)*h*(this.V_Na-V);
		I_K = this.G_K*Math.pow(n, 4)*(this.V_K-V);
		I_L = this.G_L*(this.V_L-V);
		I_ion = I_Na + I_K + I_L + I_ext;
		V = V + (I_ion*dt)/this.C;
		result.m.push(m);
		result.n.push(n);
		result.h.push(h);
		result.V.push(V);
		result.m0.push(this.m0(V));
		result.n0.push(this.n0(V));
		result.h0.push(this.h0(V));
		result.I_Na.push(I_Na);
		result.I_K.push(I_K);
	};
	return result;
};