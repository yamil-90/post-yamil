import { RequestTab } from '../App';

interface BodyViewerProps {
    currentTab: RequestTab;
    updateTab:(tab: any) => void;

}

export const BodyViewer = ({
    currentTab,
    updateTab
}: BodyViewerProps ) => {

    return  <div className="body-section">
                <textarea
                    placeholder="Request Body (JSON)"
                    value={currentTab.body}
                    onChange={(e) => updateTab({ body: e.target.value })}
                    className="body-input"
                    spellCheck="false"
                />
            </div>
}