from flask import Flask, render_template, jsonify, request
import random
app=Flask(__name__)
TRANSACTIONS=[
{"id":"TXN-1001","name":"Rahul Sharma","amount":2450,"location":"Bengaluru","device":"Known","velocity":2,"risk":18,"status":"Approved"},
{"id":"TXN-1002","name":"Priya Nair","amount":82500,"location":"Mumbai","device":"New","velocity":5,"risk":87,"status":"Held"},
{"id":"TXN-1003","name":"Arjun Mehta","amount":94000,"location":"Delhi","device":"New","velocity":8,"risk":94,"status":"Blocked"},
{"id":"TXN-1004","name":"Neha Kapoor","amount":7800,"location":"Pune","device":"Known","velocity":3,"risk":24,"status":"Approved"},
{"id":"TXN-1005","name":"Aisha Khan","amount":18500,"location":"Hyderabad","device":"New","velocity":4,"risk":68,"status":"Review"},
{"id":"TXN-1006","name":"Vikram Rao","amount":1250,"location":"Chennai","device":"Known","velocity":1,"risk":11,"status":"Approved"},
{"id":"TXN-1007","name":"Sneha Iyer","amount":67500,"location":"Kolkata","device":"New","velocity":6,"risk":91,"status":"Held"},
{"id":"TXN-1008","name":"Karan Singh","amount":4200,"location":"Jaipur","device":"Known","velocity":2,"risk":21,"status":"Approved"},
{"id":"TXN-1009","name":"Meera Joshi","amount":51000,"location":"Mumbai","device":"New","velocity":7,"risk":89,"status":"Held"},
{"id":"TXN-1010","name":"Rohan Verma","amount":3200,"location":"Bengaluru","device":"Known","velocity":2,"risk":16,"status":"Approved"}]
@app.route("/")
def home(): return render_template("dashboard.html")
@app.route("/api/transactions")
def txns():
 q=request.args.get("q","").lower().strip()
 return jsonify([t for t in TRANSACTIONS if not q or any(q in str(t[k]).lower() for k in ("id","name","location","status"))])
@app.route("/api/investigate/<tid>")
def investigate(tid):
 t=next((x for x in TRANSACTIONS if x["id"]==tid),None)
 if not t:return jsonify(error="Not found"),404
 r=t["risk"]; rec="BLOCK" if r>=90 else "HOLD" if r>=70 else "MANUAL REVIEW" if r>=50 else "APPROVE"
 factors=[("Amount anomaly",25 if t["amount"]>25000 else 4,"Amount is above the customer's normal range." if t["amount"]>25000 else "Amount is consistent with normal behavior."),("Device intelligence",18 if t["device"]=="New" else 2,"Previously unseen device detected." if t["device"]=="New" else "Known device observed."),("Velocity analysis",16 if t["velocity"]>=5 else 3,f'{t["velocity"]} payments observed in a short window.'),("Location behavior",12 if t["device"]=="New" else 3,"Location differs from established behavior." if t["device"]=="New" else "Location is normal."),("Network intelligence",8 if r>=70 else 1,"Related risk signals detected." if r>=70 else "No meaningful correlation detected.")]
 return jsonify(transaction=t,factors=[{"name":a,"score":b,"reason":c} for a,b,c in factors],recommendation=rec,confidence=min(98,72+int(r*.25)))
@app.route("/api/simulate",methods=["POST"])
def simulate():
 s=(request.json or {}).get("scenario","Account Takeover")
 presets={"Account Takeover":(347,81,1280000,219,83,45,91),"Card Testing":(512,126,760000,384,91,37,94),"Transaction Velocity Spike":(284,64,940000,176,72,36,88),"Refund Abuse":(193,43,510000,102,51,40,86),"Suspicious Device Cluster":(421,97,1640000,255,112,54,93),"Coordinated Merchant Attack":(608,154,2310000,401,139,68,96)}
 a,b,c,d,e,f,g=presets.get(s,presets["Account Takeover"])
 return jsonify(scenario=s,transactions_analyzed=10000,flagged=a,accounts=b,amount=c,blocked=d,held=e,review=f,detection=g,risk_spike=random.randint(48,74))
if __name__=="__main__": app.run(debug=True,host="127.0.0.1",port=5000)
