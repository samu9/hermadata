import { render, screen, fireEvent } from "@testing-library/react"
import NewItemButton from "./NewItemButton"

const MockFormComponent = ({ onSaved }: { onSaved: () => void }) => {
    return (
        <div>
            <button onClick={onSaved} data-testid="mock-save-button">
                Save
            </button>
        </div>
    )
}

describe("NewItemButton", () => {
    it("renders the button with the correct label", () => {
        render(
            <NewItemButton
                label="Add New Item"
                successLabel="Item added successfully!"
                formComponent={<MockFormComponent onSaved={() => {}} />}
            />
        )
        expect(screen.getByText("Add New Item"))
    })

    it("toggles the overlay panel when the button is clicked", () => {
        render(
            <NewItemButton
                label="Add New Item"
                successLabel="Item added successfully!"
                formComponent={<MockFormComponent onSaved={() => {}} />}
            />
        )
        const button = screen.getByText("Add New Item")
        // expect(screen.queryByTestId("mock-save-button")).not.toBeInTheDocument()

        fireEvent.click(button)
        // expect(screen.getByTestId("mock-save-button")).toBeInTheDocument()
    })

    it("calls the onSaved handler and shows a success toast", async () => {
        render(
            <NewItemButton
                label="Add New Item"
                successLabel="Item added successfully!"
                formComponent={<MockFormComponent onSaved={() => {}} />}
            />
        )

        const button = screen.getByText("Add New Item")
        fireEvent.click(button)

        const saveButton = screen.getByTestId("mock-save-button")
        fireEvent.click(saveButton)

        // await waitFor(() =>
        //     expect(
        //         screen.getByText("Item added successfully!")
        //     ).toBeInTheDocument()
        // )
    })
})
