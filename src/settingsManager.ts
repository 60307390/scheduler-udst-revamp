import { CoursePicker } from "./coursePicker";

export const Settings = {
    advancedMode: false,
    showProfessors: false,
    hardConflictClickable: false
}

export class SettingsManager {
    private coursePicker: CoursePicker | undefined;

    setCoursePicker(coursePicker: CoursePicker): void {
        this.coursePicker = coursePicker;
    }

    initSettings(): void {
        setupCheckbox("toggleAdvancedMode", (checked) => {
            Settings.advancedMode = checked;
            this.coursePicker?.refreshButtons();
            toggleElements(".adv-mode-exclusive", checked);
            toggleElements(".simple-mode-exclusive", !checked);
        });

        setupCheckbox("showProfessors", (checked) => {
            Settings.showProfessors = checked;
            toggleElements(".prof-preview-exclusive", checked);
        })

        setupCheckbox("hardConflictClickable", (checked) => {
            Settings.hardConflictClickable = checked;
            this.coursePicker?.refreshButtons();
        })
    }

}

function setupCheckbox(id: string, action: (checked: boolean) => void): void {
    const checkbox = document.getElementById(id) as HTMLInputElement;
    if (checkbox) {
        action(checkbox.checked);
        checkbox.addEventListener("click", () => action(checkbox.checked));
    }
}

function toggleElements(selector: string, show: boolean) {
    const elementsToToggle: NodeListOf<HTMLElement> = document.querySelectorAll(selector);
    for (const element of elementsToToggle) {
        element.classList.toggle("hidden", !show);
    }
}
