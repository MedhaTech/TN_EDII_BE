import BaseJobs from "./base.job";
import InstDReportService from "../services/instDReort.service";
export default class InstDReportJob extends BaseJobs {
    service: InstDReportService = new InstDReportService;
    protected init() {
        this.name = 'InstDReportJob';
        this.period = "0 0 * * *" //every night 12 am
        //this.period = '* * * * *' //every minute 
    };

    public async executeJob() {
        super.executeJob();
        //TODO: write the logic to execute to badges Job...!!
        return await this.service.executeInstDReport()
    }
    
}